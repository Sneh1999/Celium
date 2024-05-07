// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import "../src/WalletFactory.sol";
import "../src/Wallet.sol";

contract CounterScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        address entryPoint = 0x0576a174D229E3cFA37253523E645A78A0C91B57;
        WalletFactory walletFactory = new WalletFactory(entryPoint);
        console2.log("WalletFactory Address is:", address(walletFactory));
        vm.stopBroadcast();
    }
}
