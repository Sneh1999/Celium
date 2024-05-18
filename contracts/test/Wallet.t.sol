// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Wallet} from "../src/Wallet.sol";
import {WalletFactory} from "../src/WalletFactory.sol";

import "forge-std/Test.sol";

struct Transaction {
    address target;
    uint256 value;
    bytes data;
}

contract WalletFactoryTest is Test {
    EntryPoint entryPoint;
    WalletFactory walletFactory;
    Wallet wallet;
    address[] feeds = [
        0x14866185B1962B63C3Ea9E03Bc1da838bab34C19,
        0x635A86F9fdD16Ff09A0701C305D3a845F1758b8E,
        0xc59E3633BAAC79493d908e63626716e204A45EdF,
        0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC,
        0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E
    ];

    address[] tokens = [
        0x68194a729C2450ad26072b3D33ADaCbcef39D574,
        // GHO
        0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D,
        // LINK
        0x779877A7B0D9E8603169DdbD7836e478b4624789,
        // SNX
        0x236f697c518b7AEc0bb227d8B7547b3c27cA29bc,
        // USDC
        0xf08A50178dfcDe18524640EA6618a1f965821715
    ];

    address createdWalletAddress;
    address internal owner;
    address internal usdcWhale = 0x406C90A36c66A42Cb4699d4Dc46DF7af5dDEe199;
    ERC20 usdc = ERC20(0xf08A50178dfcDe18524640EA6618a1f965821715);
    address internal guardian;
    uint256 ownerPrivateKey = 0xa11ce;
    uint256 guardianPrivateKey = 0xabc123;
    // Set up

    function setUp() public {
        uint256 forkId = vm.createFork("https://rpc.ankr.com/eth_sepolia");
        vm.selectFork(forkId);
        owner = vm.addr(ownerPrivateKey);
        guardian = vm.addr(guardianPrivateKey);

        entryPoint = new EntryPoint();
        walletFactory = new WalletFactory(entryPoint);

        // Empty UserOp to deploy the Wallet initially
        (PackedUserOperation memory userOp, address walletAddress) = _getUserOp("", "", true);
        createdWalletAddress = walletAddress;
        _handleOp(userOp);

        // Create a test token and mint some to the owner
        vm.startPrank(usdcWhale);
        usdc.transfer(createdWalletAddress, 2_000e6);
        vm.stopPrank();
    }

    // Write actual tests here
    function test_transfer_work_with_2fa() public {
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 3e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(usdc), uint256(0), transferCalldata);

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
        uint256 balance = usdc.balanceOf(guardian);
        assertEq(balance, uint256(3e6));
    }

    function test_transfer_work_without_2fa() public {
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 1e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(usdc), uint256(0), transferCalldata);

        (PackedUserOperation memory userOp,) = _getUserOp(transactionCalldata, "", false);
        _handleOp(userOp);
        uint256 balance = usdc.balanceOf(guardian);
        assertEq(balance, uint256(1e6));
    }

    function test_approve_work_with_2fa() public {
        bytes memory approveCalldata = abi.encodeWithSelector(ERC20.approve.selector, guardian, 3e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(usdc), uint256(0), approveCalldata);

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
        uint256 allowance = usdc.allowance(createdWalletAddress, guardian);
        assertEq(allowance, uint256(3e6));
    }

    function test_approve_work_without_2fa() public {
        bytes memory approveCalldata = abi.encodeWithSelector(ERC20.approve.selector, guardian, 1e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(usdc), uint256(0), approveCalldata);

        (PackedUserOperation memory userOp,) = _getUserOp(transactionCalldata, "", false);
        _handleOp(userOp);
        uint256 allowance = usdc.allowance(createdWalletAddress, guardian);
        assertEq(allowance, uint256(1e6));
    }

    // Internals
    function _getUserOp(bytes memory callData, bytes memory paymasterAndData, bool isInitCode)
        internal
        returns (PackedUserOperation memory, address)
    {
        bytes memory initCode;
        address walletAddress;
        if (isInitCode) {
            (initCode, walletAddress) = _getInitCode(2);
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

        bytes memory createAccountData = abi.encodeWithSelector(
            createAccountSelector, owner, guardian, salt, maxAmountAllowedWithoutAuthUSD, tokens, feeds
        );

        bytes memory initCode = abi.encodePacked(address(walletFactory), createAccountData);

        address walletContract =
            walletFactory.getAddress(owner, guardian, salt, maxAmountAllowedWithoutAuthUSD, tokens, feeds);
        wallet = Wallet(payable(walletContract));

        return (initCode, walletContract);
    }

    function _handleOp(PackedUserOperation memory userOp) internal {
        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = userOp;

        entryPoint.handleOps(ops, payable(owner));
    }
}
