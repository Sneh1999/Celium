// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {BaseAccount} from "account-abstraction/core/BaseAccount.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {console2} from "forge-std/console2.sol";

contract Wallet is BaseAccount, Initializable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Events
    event WalletInitialized(IEntryPoint indexed entryPoint, address owner, address guardian, uint256 maxAmountAllowed);
    event TwoFactorAuthRequired(uint256 indexed pausedNonce);

    // Errors
    error NotEntrypointOrFactory();
    error InvalidPausedTransactionNonce();
    error GuardianSignatureVerificationFailed();

    // Structs
    struct Transaction {
        address target;
        uint256 value;
        bytes data;
    }

    // Storage
    address private immutable _walletFactory;
    IEntryPoint private immutable _entryPoint;
    // Function selector for "transfer(address,uint256)"
    bytes4 private constant TRANSFER_SELECTOR = 0xa9059cbb;

    uint256 lastUsedPausedNonce;
    uint256 maxTransferAllowedWithoutAuthUSD;
    address public owner;
    address public guardian;

    mapping(uint256 nonce => Transaction txn) public pausedTransactions;

    // Modifiers
    modifier _requireFromEntryPointOrFactory() {
        if (msg.sender != address(_entryPoint) && msg.sender != _walletFactory) revert NotEntrypointOrFactory();
        _;
    }

    constructor(IEntryPoint anEntryPoint, address ourWalletFactory) {
        _entryPoint = anEntryPoint;
        _walletFactory = ourWalletFactory;
    }

    function initialize(address _owner, address _guardian, uint256 _maxAmountAllowed) public initializer {
        owner = _owner;
        guardian = _guardian;
        maxTransferAllowedWithoutAuthUSD = _maxAmountAllowed;
        emit WalletInitialized(_entryPoint, _owner, _guardian, _maxAmountAllowed);
    }

    function execute(address target, uint256 value, bytes calldata data) external _requireFromEntryPointOrFactory {
        console2.log("hello from execute");
        bool is2FARequired = _twoFactorRequired(target, value, data);

        if (!is2FARequired) {
            _call(target, value, data);
        }
    }

    function approveTransaction(uint256 pausedNonce, bytes calldata approveSignature)
        public
        _requireFromEntryPointOrFactory
    {
        Transaction memory txn = pausedTransactions[pausedNonce];
        if (txn.data.length == 0) revert InvalidPausedTransactionNonce();
        bytes32 txnHash = keccak256(abi.encode(txn)).toEthSignedMessageHash();

        if (guardian != txnHash.recover(approveSignature)) revert GuardianSignatureVerificationFailed();

        _call(txn.target, txn.value, txn.data);
    }

    function addDeposit() public payable {
        _entryPoint.depositTo{value: msg.value}(address(this));
    }

    // Internal Functions
    function _twoFactorRequired(address target, uint256 value, bytes memory data) internal returns (bool) {
        bytes4 selector;
        console2.log("came to two factor");
        assembly {
            selector := mload(add(data, 32))
        }

        if (selector != TRANSFER_SELECTOR) return false;

        uint256 amount;
        assembly {
            // Skip 32 + 4 + 32 (length + func sig + address)
            amount := mload(add(data, 68))
        }

        // TODO: call chainlink function to determine the price
        if (amount < maxTransferAllowedWithoutAuthUSD) {
            return false;
        }
        console2.log("Two factor auth required");
        emit TwoFactorAuthRequired(lastUsedPausedNonce);
        unchecked {
            lastUsedPausedNonce++;
        }

        pausedTransactions[lastUsedPausedNonce] = Transaction({data: data, value: value, target: target});
        return true;
    }

    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        view
        override
        returns (uint256)
    {
        // bytes32 hash = userOpHash.toEthSignedMessageHash();
        console2.log("came to validate signature");
        if (owner == userOpHash.recover(userOp.signature)) {
            return 0;
        }

        return 1;
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    // View Private Variables
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    function walletFactory() public view returns (address) {
        return _walletFactory;
    }
}
