// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";

import {Wallet} from "../src/Wallet.sol";
import {WalletFactory} from "../src/WalletFactory.sol";

import "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

contract WalletFactoryTest is Test {
    EntryPoint entryPoint;
    WalletFactory walletFactory;
    Wallet wallet;

    uint256 internal ownerPrivateKey;
    uint256 internal guardianPrivateKey;

    address internal owner;
    address internal guardian;

    // Set up
    function setUp() public {
        ownerPrivateKey = 0xa11ce;
        guardianPrivateKey = 0xabc123;
        owner = vm.addr(ownerPrivateKey);
        guardian = vm.addr(guardianPrivateKey);

        entryPoint = new EntryPoint();
        walletFactory = new WalletFactory(entryPoint);

        // Empty UserOp to deploy the Wallet initially
        _handleOp(_getUserOp("", ""));
    }

    // Write actual tests here
    function test_something() public {
        assertEq(true, true);
    }

    // Internals
    function _getUserOp(bytes memory callData, bytes memory paymasterAndData)
        internal
        returns (PackedUserOperation memory)
    {
        bytes memory initCode = _getInitCode(10_000);
        address walletContract = address(wallet);
        vm.deal(walletContract, 10 ether);
        entryPoint.depositTo{value: 10 ether}(walletContract);

        PackedUserOperation memory userOp = PackedUserOperation({
            sender: walletContract,
            nonce: entryPoint.getNonce(walletContract, 0),
            initCode: initCode,
            callData: callData,
            accountGasLimits: bytes32(abi.encodePacked(uint128(2_000_000), uint128(2_000_000))),
            preVerificationGas: 100_000,
            gasFees: bytes32(abi.encodePacked(uint128(10), uint128(10))),
            paymasterAndData: paymasterAndData,
            signature: ""
        });

        bytes32 userOpHash = entryPoint.getUserOpHash(userOp);

        vm.startPrank(owner);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, userOpHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        vm.stopPrank();

        userOp.signature = signature;
        return userOp;
    }

    function _getInitCode(uint256 maxAmountAllowedWithoutAuthUSD) internal returns (bytes memory) {
        uint256 salt = 1;

        bytes4 createAccountSelector = walletFactory.createAccount.selector;
        bytes memory createAccountData =
            abi.encodeWithSelector(createAccountSelector, owner, guardian, salt, maxAmountAllowedWithoutAuthUSD);

        bytes memory initCode = abi.encodePacked(address(walletFactory), createAccountData);

        address walletContract = walletFactory.getAddress(owner, guardian, salt, maxAmountAllowedWithoutAuthUSD);
        wallet = Wallet(payable(walletContract));

        return initCode;
    }

    function _handleOp(PackedUserOperation memory userOp) internal {
        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = userOp;

        entryPoint.handleOps(ops, payable(owner));
    }
}
