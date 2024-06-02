// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";
import {CeliumContractsMultichainStorage} from "../utils/CeliumContractsMultichainStorage.sol";
import {CCIPLocalSimulatorFork} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";
import {Wallet} from "../src/Wallet.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {BurnMintERC677Helper} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {Register} from "@chainlink/local/src/ccip/Register.sol";
import {PointsPaymaster} from "../src/PointsPaymaster.sol";

struct Transaction {
    address target;
    uint256 value;
    bytes data;
}

contract CeliumTest is Test, CeliumContractsMultichainStorage {
    uint256 deployerPrivateKey = 0xa11ce;
    uint256 guardianPrivateKey = 0xb0b;

    address deployer = vm.addr(deployerPrivateKey);
    address guardian = vm.addr(guardianPrivateKey);

    CCIPLocalSimulatorFork ccipLocalSimulatorFork;
    Wallet wallet;

    uint64 ARB_SEPOLIA_CHAIN_SELECTOR = 3478487238524512106;
    uint256 arbSepoliaFork = vm.createFork("https://sepolia-rollup.arbitrum.io/rpc");

    function setUp() public {
        string memory forkRpcUrl = getForkURL("SEPOLIA");
        vm.createSelectFork(forkRpcUrl);

        ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();
        vm.makePersistent(address(ccipLocalSimulatorFork));

        initializeStorage("SEPOLIA");
        deployOurContracts();

        // Deploy one wallet through an empty UserOp
        (UserOperation memory userOp,) = _getUserOp("", "");
        _handleOp(userOp);

        // Give ether to paymaster
        vm.deal(address(POINTS_PAYMASTER), 100 ether);

        // Give USDC to wallet
        deal(address(USDC), address(wallet), 2000e6);
    }

    // TESTS
    function test_transfer_work_with_2fa() public {
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 3e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), transferCalldata);

        (UserOperation memory userOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(userOp);
        (address target, uint256 value, bytes memory data) = wallet.pausedTransactions(1);
        Transaction memory txn = Transaction(target, value, data);

        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(txn))));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(guardianPrivateKey, digest);

        uint256 nonce = 1;
        bytes memory approveTransactionCalldata =
            abi.encodeWithSelector(Wallet.approveTransaction.selector, nonce, abi.encodePacked(r, s, v));

        (UserOperation memory approveTransactionOp,) = _getUserOp(approveTransactionCalldata, "");
        _handleOp(approveTransactionOp);
        uint256 balance = USDC.balanceOf(guardian);
        assertEq(balance, uint256(3e6));
    }

    function test_transfer_work_without_2fa() public {
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 1e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), transferCalldata);

        (UserOperation memory userOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(userOp);
        uint256 balance = USDC.balanceOf(guardian);
        assertEq(balance, uint256(1e6));
    }

    function test_approve_work_with_2fa() public {
        bytes memory approveCalldata = abi.encodeWithSelector(ERC20.approve.selector, guardian, 3e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), approveCalldata);

        (UserOperation memory userOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(userOp);
        (address target, uint256 value, bytes memory data) = wallet.pausedTransactions(1);
        Transaction memory txn = Transaction(target, value, data);

        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(txn))));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(guardianPrivateKey, digest);

        uint256 nonce = 1;
        bytes memory approveTransactionCalldata =
            abi.encodeWithSelector(Wallet.approveTransaction.selector, nonce, abi.encodePacked(r, s, v));

        (UserOperation memory approveTransactionOp,) = _getUserOp(approveTransactionCalldata, "");
        _handleOp(approveTransactionOp);
        uint256 allowance = USDC.allowance(address(wallet), guardian);
        assertEq(allowance, uint256(3e6));
    }

    function test_approve_work_without_2fa() public {
        bytes memory approveCalldata = abi.encodeWithSelector(ERC20.approve.selector, guardian, 1e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), approveCalldata);

        (UserOperation memory userOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(userOp);
        uint256 allowance = USDC.allowance(address(wallet), guardian);
        assertEq(allowance, uint256(1e6));
    }

    function test_swapAndBridgeTokens() public {
        Register.NetworkDetails memory sepoliaNetworkDetails = ccipLocalSimulatorFork.getNetworkDetails(block.chainid);
        BurnMintERC677Helper ccipBnM = BurnMintERC677Helper(sepoliaNetworkDetails.ccipBnMAddress);
        ccipBnM.drip(address(wallet));

        // Transfer some weth to the wallet
        vm.deal(address(this), 500 ether);
        WETH.deposit{value: 100 ether}();
        WETH.transfer(address(wallet), 100 ether);

        bytes memory path = abi.encodePacked(address(WETH), uint24(3000), address(ccipBnM));

        bytes memory swapAndBridgeCalldata = abi.encodeWithSelector(
            Wallet.swapAndBridge.selector,
            address(WETH),
            0.1 ether,
            address(ccipBnM),
            0,
            path,
            ARB_SEPOLIA_CHAIN_SELECTOR
        );

        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(wallet), 0, swapAndBridgeCalldata);

        (UserOperation memory swapAndBridgeCalldataOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(swapAndBridgeCalldataOp);

        (address target, uint256 value, bytes memory data) = wallet.pausedTransactions(1);
        Transaction memory txn = Transaction(target, value, data);

        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(txn))));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(guardianPrivateKey, digest);

        uint256 nonce = 1;
        bytes memory approveTransactionCalldata =
            abi.encodeWithSelector(Wallet.approveTransaction.selector, nonce, abi.encodePacked(r, s, v));

        (UserOperation memory approveTransactionOp,) = _getUserOp(approveTransactionCalldata, "");
        _handleOp(approveTransactionOp);
        ccipLocalSimulatorFork.switchChainAndRouteMessage(arbSepoliaFork);

        Register.NetworkDetails memory arbSepoliaNetworkDetails =
            ccipLocalSimulatorFork.getNetworkDetails(block.chainid);
        BurnMintERC677Helper ccipBnMArbSepolia = BurnMintERC677Helper(arbSepoliaNetworkDetails.ccipBnMAddress);

        assertEq(ccipBnMArbSepolia.balanceOf(address(wallet)) > 0, true);
    }

    function test_bridgeTokens() public {
        Register.NetworkDetails memory sepoliaNetworkDetails = ccipLocalSimulatorFork.getNetworkDetails(block.chainid);
        BurnMintERC677Helper ccipBnM = BurnMintERC677Helper(sepoliaNetworkDetails.ccipBnMAddress);
        ccipBnM.drip(address(wallet));

        bytes memory bridgeCalldata =
            abi.encodeWithSelector(Wallet.bridge.selector, address(ccipBnM), 0.0001 ether, ARB_SEPOLIA_CHAIN_SELECTOR);

        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(wallet), 0, bridgeCalldata);

        (UserOperation memory bridgeCalldataOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(bridgeCalldataOp);

        (address target, uint256 value, bytes memory data) = wallet.pausedTransactions(1);
        Transaction memory txn = Transaction(target, value, data);

        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(txn))));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(guardianPrivateKey, digest);

        uint256 nonce = 1;
        bytes memory approveTransactionCalldata =
            abi.encodeWithSelector(Wallet.approveTransaction.selector, nonce, abi.encodePacked(r, s, v));

        (UserOperation memory approveTransactionOp,) = _getUserOp(approveTransactionCalldata, "");
        _handleOp(approveTransactionOp);

        ccipLocalSimulatorFork.switchChainAndRouteMessage(arbSepoliaFork);

        Register.NetworkDetails memory arbSepoliaNetworkDetails =
            ccipLocalSimulatorFork.getNetworkDetails(block.chainid);
        BurnMintERC677Helper ccipBnMArbSepolia = BurnMintERC677Helper(arbSepoliaNetworkDetails.ccipBnMAddress);

        assertEq(ccipBnMArbSepolia.balanceOf(address(wallet)) > 0, true);
    }

    // native tokens also get blocked

    function test_nativeTokenTransferBlocks() public {
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(guardian), 1 ether, "");

        (UserOperation memory userOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(userOp);
        (address target, uint256 value, bytes memory data) = wallet.pausedTransactions(1);
        Transaction memory txn = Transaction(target, value, data);

        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(txn))));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(guardianPrivateKey, digest);

        uint256 nonce = 1;
        bytes memory approveTransactionCalldata =
            abi.encodeWithSelector(Wallet.approveTransaction.selector, nonce, abi.encodePacked(r, s, v));

        (UserOperation memory approveTransactionOp,) = _getUserOp(approveTransactionCalldata, "");
        _handleOp(approveTransactionOp);

        uint256 balance = address(guardian).balance;
        assertEq(balance, 1 ether);
    }

    // test paymaster
    function test_paymasterAndPoints() public {
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 1);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), transferCalldata);

        (UserOperation memory userOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(userOp);
        transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 1e6);
        transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), transferCalldata);

        (userOp,) = _getUserOp(transactionCalldata, "");
        _handleOp(userOp);
        transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 1);
        transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), transferCalldata);

        (userOp,) = _getUserOp(transactionCalldata, "");
        bytes32 hash = POINTS_PAYMASTER.getHash(userOp, keccak256(abi.encodePacked(address(wallet))));

        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(deployerPrivateKey, digest);
        ENTRYPOINT.depositTo{value: 10 ether}(address(POINTS_PAYMASTER));
        bytes memory paymasterAndData = abi.encodePacked(
            address(POINTS_PAYMASTER),
            abi.encodePacked(address(wallet)),
            abi.encodePacked(r, s, v)
        );
        (userOp,) = _getUserOp(transactionCalldata, paymasterAndData);

        vm.expectEmit(true, false, false, false, address(POINTS_PAYMASTER));
        emit PointsPaymaster.PaymasterEvent(address(wallet));
        _handleOp(userOp);
    }

    // HELPERS

    function _getInitCode(uint256 maxAmountAllowedWithoutAuthUSD) internal returns (bytes memory, address) {
        uint256 salt = 1;
        bytes4 createAccountSelector = WALLET_FACTORY.createAccount.selector;

        bytes memory createAccountData =
            abi.encodeWithSelector(createAccountSelector, deployer, guardian, salt, maxAmountAllowedWithoutAuthUSD);

        bytes memory initCode = abi.encodePacked(address(WALLET_FACTORY), createAccountData);

        address walletContract = WALLET_FACTORY.getAddress(deployer, guardian, salt, maxAmountAllowedWithoutAuthUSD);
        wallet = Wallet(payable(walletContract));
        return (initCode, walletContract);
    }

    function _getUserOp(bytes memory callData, bytes memory paymasterAndData)
        internal
        returns (UserOperation memory, address)
    {
        (bytes memory initCode, address walletAddress) = _getInitCode(2);
        bool needsInitCode = walletAddress.code.length == 0;

        vm.deal(walletAddress, 10 ether);
        ENTRYPOINT.depositTo{value: 10 ether}(walletAddress);

        UserOperation memory userOp = UserOperation({
            sender: walletAddress,
            nonce: ENTRYPOINT.getNonce(walletAddress, 0),
            initCode: needsInitCode ? initCode : bytes(""),
            callData: callData,
            callGasLimit: 2_000_000,
            verificationGasLimit: 2_000_000,
            preVerificationGas: 100_000,
            maxFeePerGas: 10,
            maxPriorityFeePerGas: 10,
            paymasterAndData: paymasterAndData,
            signature: ""
        });

        bytes32 userOpHash = ENTRYPOINT.getUserOpHash(userOp);

        vm.startPrank(deployer);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(deployerPrivateKey, userOpHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        vm.stopPrank();

        userOp.signature = signature;
        return (userOp, walletAddress);
    }

    function _handleOp(UserOperation memory userOp) internal {
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = userOp;

        ENTRYPOINT.handleOps(ops, payable(deployer));
    }
}
