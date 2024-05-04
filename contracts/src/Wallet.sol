// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import {BaseAccount} from "account-abstraction/core/BaseAccount.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Wallet is BaseAccount, Initializable {
    using ECDSA for bytes32;
    address public immutable walletFactory;
    IEntryPoint private immutable _entryPoint;
    // Function selector for "transfer(address,uint256)"
    bytes4 private constant TRANSFER_SELECTOR = 0xa9059cbb;
    address public owner;

    event WalletInitialized(IEntryPoint indexed entryPoint, address owner);
    event TwoFactorInitiated(address indexed dest, uint256 value, bytes func);

    modifier _requireFromEntryPointOrFactory() {
        require(
            msg.sender == address(_entryPoint) || msg.sender == walletFactory,
            "only entry point or wallet factory can call"
        );
    }

    constructor(IEntryPoint anEntryPoint, address ourWalletFactory) {
        _entryPoint = anEntryPoint;
        walletFactory = ourWalletFactory;
    }

    function initialize(address memory initialOwner) public initializer {
        _initialize(initialOwner);
    }

    function _initialize(address initialOnwer) internal {
        owner = initialOnwer;
        emit WalletInitialized(_entryPoint, owner);
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        bytes memory signature = abi.decode(userOp.signature, bytes);

        if (owner != hash.recover(signature)) {
            return SIG_VALIDATION_FAILED;
        }

        return 0;
    }

    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external _requireFromEntryPointOrFactory {
        if (!twoFactorRequired()) {
            _call(dest, value, func);
        } else {
            emit TwoFactorInitiated(dest, value, func);
        }
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    function twoFactorRequired() internal returns (bool) {
        bytes4 selector;
        assembly {
            selector :=
        }
        return false;
    }

    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    function _authoriseUpgrade(
        address
    ) internal view override _requireFromEntryPointOrFactory {}
}
