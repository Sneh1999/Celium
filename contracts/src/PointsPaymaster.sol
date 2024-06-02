// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import {BasePaymaster} from "account-abstraction/core/BasePaymaster.sol";
import "../src/Wallet.sol";
import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "forge-std/console.sol";

contract PointsPaymaster is BasePaymaster {
    using ECDSA for bytes32;

    event PaymasterEvent(address indexed wallet);

    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}

    function _validatePaymasterUserOp(UserOperation calldata userOp, bytes32, uint256)
        internal
        view
        override
        returns (bytes memory context, uint256 validationData)
    {
        (address _wallet, bytes memory signature) = parsePaymasterAndData(userOp.paymasterAndData);
        bytes32 hash = getHash(userOp, keccak256(abi.encodePacked(_wallet))).toEthSignedMessageHash();

        if (hash.recover(signature) == Wallet(payable(_wallet)).owner()) {
            // Check points are greater than 2000
            if (Wallet(payable(_wallet)).points() >= 2000) {
                return (abi.encode(_wallet), 0);
            }
        }
        return (abi.encode(_wallet), 1);
    }

    /**
     * the "paymasterAndData" is expected to be the paymaster and a signature over the entire request params
     * paymasterAndData[:20] : address(this)
     * paymasterAndData[20:40] : address of wallet
     * paymasterAndData[40:] : signature
     */
    function parsePaymasterAndData(bytes calldata paymasterAndData)
        public
        pure
        returns (address _wallet, bytes memory signature)
    {
        _wallet = address(bytes20(paymasterAndData[20:40]));
        signature = paymasterAndData[40:];
    }

    function _postOp(PostOpMode, bytes calldata context, uint256) internal override {
        address _wallet = abi.decode(context, (address));
        Wallet(payable(_wallet)).burnPoints(2000);
        emit PaymasterEvent(_wallet);
    }

    function getHash(UserOperation calldata userOp, bytes32 dataHash) public view returns (bytes32) {
        return keccak256(
            abi.encode(
                userOp.sender,
                userOp.nonce,
                userOp.initCode,
                userOp.callData,
                userOp.callGasLimit,
                userOp.verificationGasLimit,
                userOp.preVerificationGas,
                userOp.maxFeePerGas,
                userOp.maxPriorityFeePerGas,
                // data of paymaster
                block.chainid,
                address(this),
                dataHash
            )
        );
    }
}
