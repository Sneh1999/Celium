// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {CeliumContractsMultichainStorage} from "../utils/CeliumContractsMultichainStorage.sol";

contract DeployCeliumContractsMultichain is Script, CeliumContractsMultichainStorage {
    uint256 deployerPrivateKey;
    address deployerAddr;

    function run() public {
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployerAddr = vm.addr(deployerPrivateKey);

        string memory selectedChain = vm.prompt(
            SELECT_CHAIN_PROMPT
        );
    }
}
