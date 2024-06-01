// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import "../src/WalletFactory.sol";
import "../src/Consumer.sol";
import "../src/FeedsRegistry.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import "../src/Constants.sol";

// import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

struct Transaction {
    address target;
    uint256 value;
    bytes data;
}

contract WalletFactoryScript is Script, Constants {
    uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
    uint256 guardianPrivateKey = vm.envUint("GUARDIAN_PRIVATE_KEY");
    address owner = vm.addr(ownerPrivateKey);
    address guardian = vm.addr(guardianPrivateKey);

    function run() public {
        vm.startBroadcast(ownerPrivateKey);

        WalletFactory walletFactory = new WalletFactory(
            IEntryPoint(ENTRYPOINT),
            address(FEEDS_REGISTRY),
            address(FUNCTIONS_CONSUMER),
            UNISWAP_UNIVERSAL_ROUTER,
            CCIP_ROUTER,
            CF_SUBSCRIPTION_ID,
            ETH,
            NATIVE_TOKEN_DECIMALS,
            address(FEEDS_REGISTRY)
        );
        assert(address(walletFactory.consumer()) == address(FUNCTIONS_CONSUMER));
        FUNCTIONS_CONSUMER.setWalletFactoryAddress(address(walletFactory));
        assert(FUNCTIONS_CONSUMER.walletFactory() == address(walletFactory));

        console2.log("WalletFactory: ", address(walletFactory));

        vm.stopBroadcast();
    }
}

// Internals
//     function _getUserOp(bytes memory callData, bytes memory paymasterAndData, bool isInitCode)
//         internal
//         returns (PackedUserOperation memory, address)
//     {
//         bytes memory initCode;
//         address walletAddress;
//         if (isInitCode) {
//             (initCode, walletAddress) = _getInitCode(2);
//         } else {
//             walletAddress = address(wallet);
//         }
//         // eth transfer
//         entryPoint.depositTo{value: 0.1 ether}(walletAddress);

//         PackedUserOperation memory userOp = PackedUserOperation({
//             sender: walletAddress,
//             nonce: entryPoint.getNonce(walletAddress, 0),
//             initCode: initCode,
//             callData: callData,
//             accountGasLimits: bytes32(abi.encodePacked(uint128(1_000_000), uint128(1_000_000))),
//             preVerificationGas: 500_000,
//             gasFees: bytes32(abi.encodePacked(uint128(2), uint128(2))),
//             paymasterAndData: paymasterAndData,
//             signature: ""
//         });

//         bytes32 userOpHash = entryPoint.getUserOpHash(userOp);

//         (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, userOpHash);
//         bytes memory signature = abi.encodePacked(r, s, v);

//         userOp.signature = signature;
//         return (userOp, walletAddress);
//     }

//     function _getInitCode(uint256 maxAmountAllowedWithoutAuthUSD) internal returns (bytes memory, address) {
//         uint256 salt = 12323;

//         bytes4 createAccountSelector = walletFactory.createAccount.selector;

//         bytes memory createAccountData =
//             abi.encodeWithSelector(createAccountSelector, owner, guardian, salt, maxAmountAllowedWithoutAuthUSD);

//         bytes memory initCode = abi.encodePacked(address(walletFactory), createAccountData);
//         address walletContract = walletFactory.getAddress(owner, guardian, salt, maxAmountAllowedWithoutAuthUSD);
//         wallet = Wallet(payable(walletContract));

//         return (initCode, walletContract);
//     }

//     function _handleOp(PackedUserOperation memory userOp) internal {
//         PackedUserOperation[] memory ops = new PackedUserOperation[](1);
//         ops[0] = userOp;

//         entryPoint.handleOps{gas: 10_000_000}(ops, payable(userOp.sender));
//     }
// }
