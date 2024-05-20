// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {BaseAccount} from "account-abstraction/core/BaseAccount.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AggregatorV3Interface} from "chainlink/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./Consumer.sol";
import "forge-std/console.sol";
import "./FeedsRegistry.sol";

contract Wallet is BaseAccount, Initializable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Events
    event WalletInitialized(IEntryPoint indexed entryPoint, address owner, address guardian, uint256 maxAmountAllowed);
    event TwoFactorAuthRequired(uint256 indexed pausedNonce);
    event ChainlinkDataFeedNotFound(address token);

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
    FeedsRegistry private immutable feedsRegistry;
    Consumer private immutable consumer;

    bytes4 private constant TRANSFER_SELECTOR = bytes4(keccak256("transfer(address,uint256)"));
    bytes4 private constant APPROVE_SELECTOR = bytes4(keccak256("approve(address,uint256)"));
    uint256 lastUsedPausedNonce;
    uint256 maxTransferAllowedWithoutAuthUSD;
    address public owner;
    address public guardian;
    address zero;
    uint64 immutable subscriptionId;

    mapping(uint256 nonce => Transaction txn) public pausedTransactions;

    AggregatorV3Interface internal dataFeed;

    // Modifiers
    modifier _requireFromEntryPointOrFactory() {
        if (msg.sender != address(_entryPoint) && msg.sender != _walletFactory) revert NotEntrypointOrFactory();
        _;
    }

    constructor(
        IEntryPoint anEntryPoint,
        address ourWalletFactory,
        address _feedsRegistry,
        address _consumer,
        uint64 _subscriptionId
    ) {
        _entryPoint = anEntryPoint;
        _walletFactory = ourWalletFactory;
        consumer = Consumer(_consumer);
        feedsRegistry = FeedsRegistry(_feedsRegistry);
        subscriptionId = _subscriptionId;
    }

    function initialize(address _owner, address _guardian, uint256 _maxAmountAllowed) public initializer {
        owner = _owner;
        guardian = _guardian;
        maxTransferAllowedWithoutAuthUSD = _maxAmountAllowed;

        emit WalletInitialized(_entryPoint, _owner, _guardian, _maxAmountAllowed);
    }

    function execute(address target, uint256 value, bytes calldata data) external _requireFromEntryPointOrFactory {
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
        uint256 tokenPrice;
        uint256 amount;
        string[] memory args = new string[](1);
        args[0] = "1";

        assembly {
            selector := mload(add(data, 32))
        }
        if (selector != TRANSFER_SELECTOR && selector != APPROVE_SELECTOR) return false;
        assembly {
            // Skip 32 + 4 + 32 (length + func sig + address)
            amount := mload(add(data, 68))
        }

        if (feedsRegistry.feeds(target) == zero) {
            return false;
        }

        console.log("what aksuha");

        dataFeed = AggregatorV3Interface(feedsRegistry.feeds(target));
        try dataFeed.latestRoundData() returns (uint80, int256 answer, uint256, uint256, uint80) {
            tokenPrice = uint256(answer);
        } catch {
            emit ChainlinkDataFeedNotFound(target);
            return false;
        }

        uint8 tokenDecimals = ERC20(target).decimals();

        if ((amount * tokenPrice) / (10 ** (tokenDecimals + dataFeed.decimals())) < maxTransferAllowedWithoutAuthUSD) {
            return false;
        }
        unchecked {
            lastUsedPausedNonce++;
        }
        emit TwoFactorAuthRequired(lastUsedPausedNonce);

        pausedTransactions[lastUsedPausedNonce] = Transaction({data: data, value: value, target: target});
        consumer.sendRequest(subscriptionId, args);
        return true;
    }

    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        view
        override
        returns (uint256)
    {
        // bytes32 hash = userOpHash.toEthSignedMessageHash();
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
