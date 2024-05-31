// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import "../src/FeedsRegistry.sol";

contract FeedsRegistryScript is Script {
    uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
    address owner = vm.addr(ownerPrivateKey);

    address[] feeds = [
        0x14866185B1962B63C3Ea9E03Bc1da838bab34C19,
        0x635A86F9fdD16Ff09A0701C305D3a845F1758b8E,
        0xc59E3633BAAC79493d908e63626716e204A45EdF,
        0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC,
        0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E,
        0x694AA1769357215DE4FAC081bf1f309aDC325306,
        0x694AA1769357215DE4FAC081bf1f309aDC325306
    ];
    address[] tokens = [
        // DAI
        0x68194a729C2450ad26072b3D33ADaCbcef39D574,
        // GHO
        0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D,
        // LINK
        0x779877A7B0D9E8603169DdbD7836e478b4624789,
        // SNX
        0x236f697c518b7AEc0bb227d8B7547b3c27cA29bc,
        // USDC
        0xf08A50178dfcDe18524640EA6618a1f965821715,
        // WETH
        0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14,
        // ETH
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    ];

    function run() public {
        vm.startBroadcast(ownerPrivateKey);
        FeedsRegistry feedsRegistry = new FeedsRegistry(tokens, feeds);
        vm.stopBroadcast();
        console2.log("FeedsRegistry ", address(feedsRegistry));
    }
}
