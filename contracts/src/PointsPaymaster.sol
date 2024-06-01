// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import {BasePaymaster} from "account-abstraction/core/BasePaymaster.sol";
import "../src/Wallet.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import "forge-std/console.sol";

contract PointsPaymaster is BasePaymaster {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address wallet;

    event PaymasterEvent(address indexed wallet);

    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}

    function _validatePaymasterUserOp(PackedUserOperation calldata userOp, bytes32, uint256)
        internal
        view
        override
        returns (bytes memory context, uint256 validationData)
    {
        console.log("i came here");
        (address _wallet, bytes memory signature) = parsePaymasterAndData(userOp.paymasterAndData);
        console.log("i came here too ");

        bytes32 hash = getHash(userOp, keccak256(abi.encodePacked(_wallet))).toEthSignedMessageHash();

        if (hash.recover(signature) == Wallet(payable(_wallet)).owner()) {
            // Check points are greater than 2000
            if (Wallet(payable(_wallet)).points() >= 2000) {
                return (abi.encode(_wallet), 0);
            }
        }
        // Signature validation failed
        console.log("hello ");

        return (abi.encode(wallet), 1);
    }

    function parsePaymasterAndData(bytes calldata paymasterAndData)
        public
        pure
        returns (address _wallet, bytes memory signature)
    {
        _wallet = address(bytes20(paymasterAndData[PAYMASTER_DATA_OFFSET:PAYMASTER_DATA_OFFSET + 20]));
        signature = paymasterAndData[PAYMASTER_DATA_OFFSET + 20:];
    }

    function _postOp(PostOpMode, bytes calldata context, uint256, uint256) internal override {
        address _wallet = abi.decode(context, (address));
        Wallet(payable(_wallet)).burnPoints(2000);
        emit PaymasterEvent(_wallet);
    }

    function getHash(PackedUserOperation calldata userOp, bytes32 dataHash) public view returns (bytes32) {
        return keccak256(
            abi.encode(
                userOp.sender,
                userOp.nonce,
                userOp.initCode,
                userOp.callData,
                userOp.accountGasLimits,
                userOp.preVerificationGas,
                userOp.gasFees,
                // data of paymaster
                block.chainid,
                address(this),
                dataHash
            )
        );
    }
}
