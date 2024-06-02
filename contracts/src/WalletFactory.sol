// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {Wallet} from "./Wallet.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Consumer} from "./Consumer.sol";

import {IRouterClient} from "ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {IUniversalRouter} from "universal-router/contracts/interfaces/IUniversalRouter.sol";

contract WalletFactory {
    Wallet public immutable walletImplementation;
    Consumer public immutable consumer;

    constructor(
        IEntryPoint entryPoint,
        address feedsRegistry,
        address _consumer,
        IUniversalRouter _universalRouter,
        IRouterClient ccipRouter,
        address _native,
        uint8 _nativeTokenDecimals,
        address _paymaster
    ) {
        walletImplementation = new Wallet(
            entryPoint,
            address(this),
            feedsRegistry,
            _consumer,
            _universalRouter,
            ccipRouter,
            _native,
            _nativeTokenDecimals,
            _paymaster
        );
        consumer = Consumer(_consumer);
    }

    function createAccount(address owner, address guardian, uint256 salt, uint256 maxAmountAllowed)
        external
        returns (Wallet)
    {
        address addr = getAddress(owner, guardian, salt, maxAmountAllowed);

        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return Wallet(payable(addr));
        }

        bytes memory walletInit = abi.encodeCall(Wallet.initialize, (owner, guardian, maxAmountAllowed));
        ERC1967Proxy proxy = new ERC1967Proxy{salt: bytes32(salt)}(address(walletImplementation), walletInit);
        if (address(consumer) != address(0)) {
            consumer.setAuthorizedWallet(address(proxy), true);
        }
        return Wallet(payable(address(proxy)));
    }

    function getAddress(address owner, address guardian, uint256 salt, uint256 maxAmountAllowed)
        public
        view
        returns (address)
    {
        bytes memory walletInit = abi.encodeCall(Wallet.initialize, (owner, guardian, maxAmountAllowed));
        bytes memory proxyConstructor = abi.encode(address(walletImplementation), walletInit);
        bytes memory bytecode = abi.encodePacked(type(ERC1967Proxy).creationCode, proxyConstructor);

        bytes32 bytecodeHash = keccak256(bytecode);

        return Create2.computeAddress(bytes32(salt), bytecodeHash);
    }
}
