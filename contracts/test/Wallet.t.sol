// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Wallet} from "../src/Wallet.sol";
import {WalletFactory} from "../src/WalletFactory.sol";
import {TestERC20} from "../src/TestERC20.sol";

import "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

struct Transaction {
    address target;
    uint256 value;
    bytes data;
}

contract WalletFactoryTest is Test {
    EntryPoint entryPoint;
    WalletFactory walletFactory;
    Wallet wallet;

    address createdWalletAddress;
    address internal owner;
    ERC20 internal testToken;
    address internal guardian;
    uint256 ownerPrivateKey = 0xa11ce;
    uint256 guardianPrivateKey = 0xabc123;
    // Set up

    function setUp() public {
        owner = vm.addr(ownerPrivateKey);
        guardian = vm.addr(guardianPrivateKey);

        entryPoint = new EntryPoint();
        walletFactory = new WalletFactory(entryPoint);

        // Empty UserOp to deploy the Wallet initially
        (PackedUserOperation memory userOp, address walletAddress) = _getUserOp("", "", true);
        createdWalletAddress = walletAddress;
        _handleOp(userOp);

        // Create a test token and mint some to the owner
        vm.startPrank(owner);
        testToken = new TestERC20(1_000_000 ether);
        testToken.transfer(createdWalletAddress, 1_000_000 ether);
        vm.stopPrank();
    }

    // Write actual tests here
    function test_approve_transaction_works() public {
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 10_001 ether);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(testToken), uint256(0), transferCalldata);

        (PackedUserOperation memory userOp,) = _getUserOp(transactionCalldata, "", false);
        _handleOp(userOp);
        (address target, uint256 value, bytes memory data) = wallet.pausedTransactions(1);
        Transaction memory txn = Transaction(target, value, data);

        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(txn))));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(guardianPrivateKey, digest);

        uint256 nonce = 1;
        bytes memory approveTransactionCalldata =
            abi.encodeWithSelector(Wallet.approveTransaction.selector, nonce, abi.encodePacked(r, s, v));

        (PackedUserOperation memory approveTransactionOp,) = _getUserOp(approveTransactionCalldata, "", false);
        _handleOp(approveTransactionOp);
        uint256 balance = testToken.balanceOf(guardian);
        assertEq(balance, uint256(10_001 ether));
    }

    // Internals
    function _getUserOp(bytes memory callData, bytes memory paymasterAndData, bool isInitCode)
        internal
        returns (PackedUserOperation memory, address)
    {
        bytes memory initCode;
        address walletAddress;
        if (isInitCode) {
            (initCode, walletAddress) = _getInitCode(10_000);
        }
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
        return (userOp, walletAddress);
    }

    function _getInitCode(uint256 maxAmountAllowedWithoutAuthUSD) internal returns (bytes memory, address) {
        uint256 salt = 1;

        bytes4 createAccountSelector = walletFactory.createAccount.selector;
        bytes memory createAccountData =
            abi.encodeWithSelector(createAccountSelector, owner, guardian, salt, maxAmountAllowedWithoutAuthUSD);

        bytes memory initCode = abi.encodePacked(address(walletFactory), createAccountData);

        address walletContract = walletFactory.getAddress(owner, guardian, salt, maxAmountAllowedWithoutAuthUSD);
        wallet = Wallet(payable(walletContract));

        return (initCode, walletContract);
    }

    function _handleOp(PackedUserOperation memory userOp) internal {
        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = userOp;

        entryPoint.handleOps(ops, payable(owner));
    }
}
