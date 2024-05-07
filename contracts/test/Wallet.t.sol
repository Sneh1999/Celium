// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {Script, console2} from "forge-std/Script.sol";
import "../src/WalletFactory.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";

import "../src/Wallet.sol";

contract WalletFactoryTest is Test {
    uint256 testNumber;
    WalletFactory walletFactory;
    PackedUserOperation userOp;
    address owner = 0x31f6265B7B2D1e03E2874450AFE4716F0ff3C70a;
    address guardian = 0xeBa32c7eAdC77e27efe143a4791FACf3d8e4D264;

    function setupUserOp() public returns (PackedUserOperation) {
        bytes4 executeSelector = keccak256("execute(address target, uint256 value, bytes calldata data)");
        address executeTarget = 0xdb6EAFFa95899B53b27086Bd784F3BBFd58Ff843;
        uint256 executeValue = 1;
        bytes data = abi.encodeWithSelector(bytes4, arg);
        bytes createAccountSelector = walletFactory.createAccount.selector;
        uint256 salt = 1;
        bytes createAccountData = abi.encodeWithSelector(createAccountSelector, (owner, guardian, salt, executeValue));
        bytes initCode = abi.encode(address(walletFactory), createAccountData);
        userOp = PackedUserOperation({
            sender: owner,
            nonce: 0,
            initCode: initCode,
            callData: abi.encodeWithSelector(executeSelector, (executeTarget, executeValue, initCode)),
            accountGasLimits: 180000,
            gasFees: 1000000000,
            signature: "0x"
        });
        return userOp;
    }

    function setUp() public {
        address entryPoint = 0x0576a174D229E3cFA37253523E645A78A0C91B57;
        walletFactory = new WalletFactory(entryPoint);
        console2.log("WalletFactory Address is:", address(walletFactory));
    }

    function test_NumberIs42() public {
        assertEq(testNumber, 42);
    }

    function testFail_Subtract43() public {
        testNumber -= 43;
    }
}
