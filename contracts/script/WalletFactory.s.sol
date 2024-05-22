// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import "../src/WalletFactory.sol";
import "../src/Consumer.sol";
import "../src/FeedsRegistry.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";

// import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

struct Transaction {
    address target;
    uint256 value;
    bytes data;
}

contract WalletFactoryScript is Script {
    uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
    uint256 guardianPrivateKey = vm.envUint("GUARDIAN_PRIVATE_KEY");
    address owner = vm.addr(ownerPrivateKey);
    address guardian = vm.addr(guardianPrivateKey);
    uint64 subscriptionId = 2760;

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

    FeedsRegistry feedsRegistry = FeedsRegistry(0x0B7f332ECeF4141B6eb314C96363E777D1Ede2a4);
    ERC20 link = ERC20(0x779877A7B0D9E8603169DdbD7836e478b4624789);
    EntryPoint entryPoint = EntryPoint(payable(0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF));

    WalletFactory walletFactory;
    Wallet wallet;
    Consumer functionsConsumer = Consumer(0xf99F35d284675D594Cf0dda5C7B8979Df947e134);

    function run() public {
        vm.startBroadcast(ownerPrivateKey);

        walletFactory = new WalletFactory(
            IEntryPoint(entryPoint), address(feedsRegistry), address(functionsConsumer), subscriptionId
        );
        assert(address(walletFactory.consumer()) == address(functionsConsumer));
        functionsConsumer.setWalletFactoryAddress(address(walletFactory));
        assert(functionsConsumer.walletFactory() == address(walletFactory));
        console2.log("FeedsRegistry: ", address(feedsRegistry));
        console2.log("LINK Token: ", address(link));
        console2.log("EntryPoint: ", address(entryPoint));

        console2.log("WalletFactory: ", address(walletFactory));
        console2.log("Wallet Implementation: ", address(walletFactory.walletImplementation()));
        console2.log("Functions Consumer: ", address(functionsConsumer));

        // Create a wallet

        (PackedUserOperation memory initialUserOp, address walletAddr) = _getUserOp("", "", true);
        _handleOp(initialUserOp);
        assert(address(walletAddr).code.length > 0);

        // Send some LINK to created wallet
        // and deposit some ETH to entrypoint for gas
        link.transfer(address(wallet), 2e18);

        // Transfer 1 LINK token to guardian
        // This should pause the transaction
        bytes memory transferCalldata = abi.encodeWithSelector(ERC20.transfer.selector, guardian, 1e18);
        bytes memory transactionCalldata =
            abi.encodeWithSelector(Wallet.execute.selector, address(link), uint256(0), transferCalldata);
        (PackedUserOperation memory transferTokenUserOp,) = _getUserOp(transactionCalldata, "", false);
        _handleOp(transferTokenUserOp);

        // Get the paused transaction
        (address target, uint256 value, bytes memory data) = wallet.pausedTransactions(1);
        Transaction memory txn = Transaction(target, value, data);
        assert(target == address(link));

        // Guardian signs over the paused txn data
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(txn))));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(guardianPrivateKey, digest);

        // Approve transaction with guardian signature
        uint256 pausedTxnNonce = 1;
        bytes memory approveTransactionCalldata =
            abi.encodeWithSelector(Wallet.approveTransaction.selector, pausedTxnNonce, abi.encodePacked(r, s, v));

        (PackedUserOperation memory approveTransactionOp,) = _getUserOp(approveTransactionCalldata, "", false);
        _handleOp(approveTransactionOp);

        // Guardian should have LINK token now
        uint256 balance = link.balanceOf(guardian);
        assert(balance > 0);

        console2.log("Guardian link balance: ", balance);
        vm.stopBroadcast();
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
        } else {
            walletAddress = address(wallet);
        }
        // eth transfer
        entryPoint.depositTo{value: 0.1 ether}(walletAddress);

        PackedUserOperation memory userOp = PackedUserOperation({
            sender: walletAddress,
            nonce: entryPoint.getNonce(walletAddress, 0),
            initCode: initCode,
            callData: callData,
            accountGasLimits: bytes32(abi.encodePacked(uint128(1_000_000), uint128(1_000_000))),
            preVerificationGas: 500_000,
            gasFees: bytes32(abi.encodePacked(uint128(2), uint128(2))),
            paymasterAndData: paymasterAndData,
            signature: ""
        });

        bytes32 userOpHash = entryPoint.getUserOpHash(userOp);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, userOpHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        userOp.signature = signature;
        return (userOp, walletAddress);
    }

    function _getInitCode(uint256 maxAmountAllowedWithoutAuthUSD) internal returns (bytes memory, address) {
        uint256 salt = 12323;

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

        entryPoint.handleOps{gas: 10_000_000}(ops, payable(userOp.sender));
    }
}
