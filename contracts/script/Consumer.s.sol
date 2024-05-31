// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import "../src/Consumer.sol";

contract ConsumerScript is Script {
    uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
    address owner = vm.addr(ownerPrivateKey);
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 donID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;
    string endpoint = "https://celium.com/api";

    function run() public {
        vm.startBroadcast(ownerPrivateKey);
        Consumer consumer = new Consumer(router, donID, endpoint);
        vm.stopBroadcast();
        console2.log("Consumer ", address(consumer));
    }
}
