// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Wallet} from "../src/Wallet.sol";
import {WalletFactory} from "../src/WalletFactory.sol";
import {FeedsRegistry} from "../src/FeedsRegistry.sol";
import {CCIPLocalSimulatorFork} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";
import {Register} from "@chainlink/local/src/ccip/Register.sol";
import {WETH9} from "@chainlink/local/src/shared/WETH9.sol";
import {BurnMintERC677Helper} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import "../src/Consumer.sol";
import "forge-std/Test.sol";
import "../src/Constants.sol";

struct Transaction {
    address target;
    uint256 value;
    bytes data;
}

contract WalletFactoryTest is Test, Constants {
    WalletFactory walletFactory;
    Wallet wallet;

    CCIPLocalSimulatorFork ccipLocalSimulatorFork;

    address _walletFactory = 0xF369CB5209dA8F59e78efe3a8B3f8ccEe7428c5A;
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;

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
    address internal guardian;

    uint256 ownerPrivateKey = 0xa11ce;
    uint256 guardianPrivateKey = 0xabc123;
    uint256 sepoliaFork;
    uint256 arbSepoliaFork;

    // Set up

    function setUp() public {
        sepoliaFork = vm.createSelectFork(ETHEREUM_SEPOLIA_RPC_URL);
        arbSepoliaFork = vm.createFork(ARBITRUM_SEPOLIA_RPC_URL);

        ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();
        vm.makePersistent(address(ccipLocalSimulatorFork));

        // Mock the owner and guradian on sepolia
        owner = vm.addr(ownerPrivateKey);
        guardian = vm.addr(guardianPrivateKey);
        walletFactory = new WalletFactory(
            ENTRYPOINT,
            address(FEEDS_REGISTRY),
            address(FUNCTIONS_CONSUMER),
            UNISWAP_UNIVERSAL_ROUTER,
            CCIP_ROUTER,
            CF_SUBSCRIPTION_ID
        );

        FUNCTIONS_CONSUMER.setWalletFactoryAddress(address(walletFactory));

        // Deploy uniswap router
        // Empty UserOp to deploy the Wallet initially
        (PackedUserOperation memory userOp, address walletAddress) = _getUserOp("", "", true);
        createdWalletAddress = walletAddress;
        console.log("Wallet address", walletAddress);
        _handleOp(userOp);

        // Create a test token and mint some to the owner
        vm.startPrank(USDC_WHALE);
        USDC.transfer(createdWalletAddress, 2_000e6);
        // transfer eth from usdc whale to created wallet
        vm.stopPrank();
    }

    // Write actual tests here
    function test_transfer_work_with_2fa() public {
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 3e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), transferCalldata);

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
        uint256 balance = USDC.balanceOf(guardian);
        assertEq(balance, uint256(3e6));
    }

    function test_transfer_work_without_2fa() public {
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 1e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), transferCalldata);

        (PackedUserOperation memory userOp,) = _getUserOp(transactionCalldata, "", false);
        _handleOp(userOp);
        uint256 balance = USDC.balanceOf(guardian);
        assertEq(balance, uint256(1e6));
    }

    function test_approve_work_with_2fa() public {
        bytes memory approveCalldata = abi.encodeWithSelector(ERC20.approve.selector, guardian, 3e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), approveCalldata);

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
        uint256 allowance = USDC.allowance(createdWalletAddress, guardian);
        assertEq(allowance, uint256(3e6));
    }

    function test_approve_work_without_2fa() public {
        bytes memory approveCalldata = abi.encodeWithSelector(ERC20.approve.selector, guardian, 1e6);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(USDC), uint256(0), approveCalldata);

        (PackedUserOperation memory userOp,) = _getUserOp(transactionCalldata, "", false);
        _handleOp(userOp);
        uint256 allowance = USDC.allowance(createdWalletAddress, guardian);
        assertEq(allowance, uint256(1e6));
    }

    // TEST CCIP and Uniswap
    function test_swapAndBridgeTokens() public {
        Register.NetworkDetails memory sepoliaNetworkDetails = ccipLocalSimulatorFork.getNetworkDetails(block.chainid);
        BurnMintERC677Helper ccipBnM = BurnMintERC677Helper(sepoliaNetworkDetails.ccipBnMAddress);
        ccipBnM.drip(createdWalletAddress);

        // Transfer some weth to the wallet
        vm.deal(address(this), 500 ether);
        WETH.deposit{value: 100 ether}();
        WETH.transfer(createdWalletAddress, 100 ether);

        bytes memory path = abi.encodePacked(address(WETH), uint24(3000), address(ccipBnM));

        bytes memory swapAndBridgeCalldata = abi.encodeWithSelector(
            Wallet.swapAndBridge.selector, WETH, address(ccipBnM), 0.0001 ether, 0, path, ARB_SEPOLIA_CHAIN_SELECTOR
        );

        (PackedUserOperation memory swapAndBridgeCalldataOp,) = _getUserOp(swapAndBridgeCalldata, "", false);
        _handleOp(swapAndBridgeCalldataOp);
        ccipLocalSimulatorFork.switchChainAndRouteMessage(arbSepoliaFork);

        Register.NetworkDetails memory arbSepoliaNetworkDetails =
            ccipLocalSimulatorFork.getNetworkDetails(block.chainid);
        BurnMintERC677Helper ccipBnMArbSepolia = BurnMintERC677Helper(arbSepoliaNetworkDetails.ccipBnMAddress);

        assertEq(ccipBnMArbSepolia.balanceOf(createdWalletAddress) > 0, true);
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
        ENTRYPOINT.depositTo{value: 10 ether}(walletContract);

        PackedUserOperation memory userOp = PackedUserOperation({
            sender: walletContract,
            nonce: ENTRYPOINT.getNonce(walletContract, 0),
            initCode: initCode,
            callData: callData,
            accountGasLimits: bytes32(abi.encodePacked(uint128(2_000_000), uint128(2_000_000))),
            preVerificationGas: 100_000,
            gasFees: bytes32(abi.encodePacked(uint128(10), uint128(10))),
            paymasterAndData: paymasterAndData,
            signature: ""
        });

        bytes32 userOpHash = ENTRYPOINT.getUserOpHash(userOp);

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

        ENTRYPOINT.handleOps(ops, payable(owner));
    }
}
