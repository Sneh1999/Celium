// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import "../src/WalletFactory.sol";
import "../src/Consumer.sol";
import "../src/FeedsRegistry.sol";

import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

contract WalletFactoryScript is Script {
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
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 donID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    address entryPoint = 0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF;

    function setUp() public {}

    function run() public {
        uint64 subscriptionId = 2760;
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(privateKey);
        FeedsRegistry feedsRegistry = new FeedsRegistry(tokens, feeds);
        Consumer consumer = new Consumer(router, donID);
        WalletFactory walletFactory =
            new WalletFactory(IEntryPoint(entryPoint), address(feedsRegistry), address(consumer), subscriptionId);
        consumer.setWalletFactoryAddress(address(walletFactory));
        vm.stopBroadcast();
        console2.log("WalletFactory address: ", address(walletFactory));
        console2.log("FeedsRegistry address: ", address(feedsRegistry));
        console2.log("Consumer address: ", address(consumer));
    }
}
