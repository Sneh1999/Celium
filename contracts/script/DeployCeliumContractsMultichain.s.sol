// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {CeliumContractsMultichainStorage} from "../utils/CeliumContractsMultichainStorage.sol";

contract DeployCeliumContractsMultichain is Script, CeliumContractsMultichainStorage {
    uint256 deployerPrivateKey;
    address deployerAddr;

    address guardianAddr;

    function run() public {
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployerAddr = vm.addr(deployerPrivateKey);

        string memory selectedChain = vm.prompt(SELECT_CHAIN_PROMPT);

        if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("ALL"))) {
            for (uint256 i = 0; i < CHAIN_OPTIONS.length - 1; i++) {
                _deploy(CHAIN_OPTIONS[i]);
            }
        } else {
            _deploy(selectedChain);
        }
    }

    function _deploy(string memory selectedChain) internal {
        console2.log("Selected Chain: ", selectedChain);
        vm.createSelectFork(getForkURL(selectedChain));
        vm.startBroadcast(deployerPrivateKey);
        initializeStorage(selectedChain);
        deployOurContracts();
        vm.stopBroadcast();
        console2.log("==============================", selectedChain);
    }
}
