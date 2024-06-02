// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {FeedsRegistry} from "../src/FeedsRegistry.sol";
import {IUniversalRouter} from "universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IRouterClient} from "ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {IFunctionsRouter} from "chainlink/src/v0.8/functions/v1_0_0/interfaces/IFunctionsRouter.sol";
import {Consumer} from "../src/Consumer.sol";
import {WalletFactory} from "../src/WalletFactory.sol";
import {PointsPaymaster} from "../src/PointsPaymaster.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {WETH9} from "@chainlink/local/src/shared/WETH9.sol";

abstract contract CeliumContractsMultichainStorage {
    struct USDPriceFeed {
        string name;
        address tokenAddress;
        address priceFeed;
    }

    // Script/Test Helpers
    string[] CHAIN_OPTIONS = ["SEPOLIA", "ARBITRUM_SEPOLIA", "AVALANCHE_FUJI", "SCROLL_SEPOLIA", "POLYGON_AMOY", "ALL"];

    string SELECT_CHAIN_PROMPT =
        "Select chain to deploy on: SEPOLIA, ARBITRUM_SEPOLIA, AVALANCHE_FUJI, SCROLL_SEPOLIA, POLYGON_AMOY, ALL";

    // External Contracts
    IEntryPoint ENTRYPOINT;
    IUniversalRouter UNIVERSAL_ROUTER;
    IRouterClient CCIP_ROUTER;

    // Chainlink Functions Parameters
    IFunctionsRouter FUNCTIONS_ROUTER;
    uint64 CF_SUBSCRIPTION_ID;
    bytes32 CF_DON_ID;

    // Chainlink Price Feed Parameters
    USDPriceFeed[] USD_PRICE_FEEDS;
    address NATIVE_TOKEN_ADDRESS;
    uint8 NATIVE_TOKEN_DECIMALS = 18;

    // Our Contracts
    FeedsRegistry FEEDS_REGISTRY;
    Consumer FUNCTIONS_CONSUMER;
    WalletFactory WALLET_FACTORY;
    PointsPaymaster POINTS_PAYMASTER;

    // Our Parameters
    string CF_ENDPOINT = "https://celium-inky.vercel.app/api/request-2fa";

    // Tests Only Parameters
    ERC20 USDC;
    WETH9 WETH;

    function getForkURL(string memory selectedChain) internal pure returns (string memory forkUrl) {
        if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("SEPOLIA"))) {
            return "https://rpc.ankr.com/eth_sepolia";
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("ARBITRUM_SEPOLIA"))) {
            return "https://sepolia-rollup.arbitrum.io/rpc";
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("AVALANCHE_FUJI"))) {
            return "https://api.avax-test.network/ext/bc/C/rpc";
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("SCROLL_SEPOLIA"))) {
            return "https://api.sepolia.scroll.io/rpc";
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("POLYGON_AMOY"))) {
            return "";
        }

        require(false, "Invalid selectedChain parameter");
    }

    function initializeStorage(string memory selectedChain) internal {
        if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("SEPOLIA"))) {
            return _initializeStorageForSepolia();
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("ARBITRUM_SEPOLIA"))) {
            return _initializeStorageForArbitrumSepolia();
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("AVALANCHE_FUJI"))) {
            return _initializeStorageForAvalancheFuji();
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("SCROLL_SEPOLIA"))) {
            return _initializeStorageForScrollSepolia();
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("POLYGON_AMOY"))) {
            return _initializeStorageForPolygonAmoy();
        }

        require(false, "Invalid selectedChain parameter");
    }

    function deployOurContracts() internal {
        address[] memory tokens = new address[](USD_PRICE_FEEDS.length);
        address[] memory feeds = new address[](USD_PRICE_FEEDS.length);

        for (uint256 i = 0; i < USD_PRICE_FEEDS.length; i++) {
            USDPriceFeed memory usdPriceFeed = USD_PRICE_FEEDS[i];
            tokens[i] = usdPriceFeed.tokenAddress;
            feeds[i] = usdPriceFeed.priceFeed;
        }

        FEEDS_REGISTRY = new FeedsRegistry(tokens, feeds);

        FUNCTIONS_CONSUMER = new Consumer(address(FUNCTIONS_ROUTER), CF_SUBSCRIPTION_ID, CF_DON_ID, CF_ENDPOINT);
        POINTS_PAYMASTER = new PointsPaymaster(ENTRYPOINT);
        WALLET_FACTORY = new WalletFactory(
            ENTRYPOINT,
            address(FEEDS_REGISTRY),
            address(FUNCTIONS_CONSUMER),
            UNIVERSAL_ROUTER,
            CCIP_ROUTER,
            NATIVE_TOKEN_ADDRESS,
            NATIVE_TOKEN_DECIMALS,
            address(POINTS_PAYMASTER)
        );

        FUNCTIONS_CONSUMER.setWalletFactoryAddress(address(WALLET_FACTORY));
    }

    function _initializeStorageForSepolia() private {
        // External Contracts
        ENTRYPOINT = IEntryPoint(payable(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
        UNIVERSAL_ROUTER = IUniversalRouter(0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD);
        CCIP_ROUTER = IRouterClient(0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59);

        // Chainlink Functions Parameters
        FUNCTIONS_ROUTER = IFunctionsRouter(0xb83E47C2bC239B3bf370bc41e1459A34b41238D0);
        CF_SUBSCRIPTION_ID = 3014;
        CF_DON_ID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

        // Chainlink Price Feed Parameters
        delete USD_PRICE_FEEDS;
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "DAI",
                tokenAddress: 0x68194a729C2450ad26072b3D33ADaCbcef39D574,
                priceFeed: 0x14866185B1962B63C3Ea9E03Bc1da838bab34C19
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "LINK",
                tokenAddress: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
                priceFeed: 0xc59E3633BAAC79493d908e63626716e204A45EdF
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "USDC",
                tokenAddress: 0xf08A50178dfcDe18524640EA6618a1f965821715,
                priceFeed: 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "WETH",
                tokenAddress: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14,
                priceFeed: 0x694AA1769357215DE4FAC081bf1f309aDC325306
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "ETH",
                tokenAddress: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE,
                priceFeed: 0x694AA1769357215DE4FAC081bf1f309aDC325306
            })
        );
        NATIVE_TOKEN_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        USDC = ERC20(0xf08A50178dfcDe18524640EA6618a1f965821715);
        WETH = WETH9(payable(0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14));
    }

    function _initializeStorageForArbitrumSepolia() private {
        // External Contracts
        ENTRYPOINT = IEntryPoint(payable(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
        UNIVERSAL_ROUTER = IUniversalRouter(0xFE6508f0015C778Bdcc1fB5465bA5ebE224C9912);
        CCIP_ROUTER = IRouterClient(0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165);

        // Chainlink Functions Parameters
        FUNCTIONS_ROUTER = IFunctionsRouter(0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C);
        CF_SUBSCRIPTION_ID = 89;
        CF_DON_ID = 0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000;

        // Chainlink Price Feed Parameters
        delete USD_PRICE_FEEDS;
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "USDC",
                tokenAddress: 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d,
                priceFeed: 0x0153002d20B96532C639313c2d54c3dA09109309
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "LINK",
                tokenAddress: 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E,
                priceFeed: 0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "WETH",
                tokenAddress: 0x1bdc540dEB9Ed1fA29964DeEcCc524A8f5e2198e,
                priceFeed: 0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "ETH",
                tokenAddress: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE,
                priceFeed: 0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165
            })
        );

        NATIVE_TOKEN_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        USDC = ERC20(0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d);
        WETH = WETH9(payable(0x1bdc540dEB9Ed1fA29964DeEcCc524A8f5e2198e));
    }

    function _initializeStorageForAvalancheFuji() private {
        // External Contracts
        ENTRYPOINT = IEntryPoint(payable(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
        // No uniswap here
        UNIVERSAL_ROUTER = IUniversalRouter(address(0));
        CCIP_ROUTER = IRouterClient(0xF694E193200268f9a4868e4Aa017A0118C9a8177);

        // Chainlink Functions Parameters
        FUNCTIONS_ROUTER = IFunctionsRouter(0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0);
        CF_SUBSCRIPTION_ID = 9122;
        CF_DON_ID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;

        // Chainlink Price Feed Parameters
        delete USD_PRICE_FEEDS;
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "LINK",
                tokenAddress: 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846,
                priceFeed: 0x34C4c526902d88a3Aa98DB8a9b802603EB1E3470
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "USDC",
                tokenAddress: 0x5425890298aed601595a70AB815c96711a31Bc65,
                priceFeed: 0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({name: "AVAX", tokenAddress: address(0), priceFeed: 0x5498BB86BC934c8D34FDA08E81D444153d0D06aD})
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "WAVAX",
                tokenAddress: 0xd00ae08403B9bbb9124bB305C09058E32C39A48c,
                priceFeed: 0x5498BB86BC934c8D34FDA08E81D444153d0D06aD
            })
        );

        NATIVE_TOKEN_ADDRESS = address(0);
        USDC = ERC20(0x5425890298aed601595a70AB815c96711a31Bc65);
        WETH = WETH9(payable(0xd00ae08403B9bbb9124bB305C09058E32C39A48c));
    }

    function _initializeStorageForScrollSepolia() private {
        // External Contracts
        ENTRYPOINT = IEntryPoint(payable(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
        // No uniswap here
        UNIVERSAL_ROUTER = IUniversalRouter(address(0));
        // No CCIP here
        CCIP_ROUTER = IRouterClient(address(0));

        // NO CHAINLINK FUNCTIONS HERE
        FUNCTIONS_ROUTER = IFunctionsRouter(address(0));
        CF_SUBSCRIPTION_ID = 0;
        CF_DON_ID = bytes32(0);

        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "ETH",
                tokenAddress: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE,
                priceFeed: 0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "LINK",
                tokenAddress: 0x279cBF5B7e3651F03CB9b71A9E7A3c924b267801,
                priceFeed: 0xaC3E04999aEfE44D508cB3f9B972b0Ecd07c1efb
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "USDC",
                tokenAddress: 0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D,
                priceFeed: 0xFadA8b0737D4A3AE7118918B7E69E689034c0127
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "WETH",
                tokenAddress: 0xfa6a407c4C49Ea1D46569c1A4Bcf71C3437bE54c,
                priceFeed: 0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41
            })
        );

        NATIVE_TOKEN_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        USDC = ERC20(0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D);
        WETH = WETH9(payable(0xfa6a407c4C49Ea1D46569c1A4Bcf71C3437bE54c));
    }

    function _initializeStorageForPolygonAmoy() private {
        // External Contracts
        ENTRYPOINT = IEntryPoint(payable(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
        // No uniswap here
        UNIVERSAL_ROUTER = IUniversalRouter(address(0));
        CCIP_ROUTER = IRouterClient(0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2);

        // Chainlink Functions Parameters
        FUNCTIONS_ROUTER = IFunctionsRouter(0xC22a79eBA640940ABB6dF0f7982cc119578E11De);
        CF_SUBSCRIPTION_ID = 300;
        CF_DON_ID = 0x66756e2d706f6c79676f6e2d616d6f792d310000000000000000000000000000;

        // Chainlink Price Feed Parameters
        delete USD_PRICE_FEEDS;
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "MATIC",
                tokenAddress: address(0),
                priceFeed: 0x001382149eBa3441043c1c66972b4772963f5D43
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "USDC",
                tokenAddress: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582,
                priceFeed: 0x1b8739bB4CdF0089d07097A9Ae5Bd274b29C6F16
            })
        );
        USD_PRICE_FEEDS.push(
            USDPriceFeed({
                name: "LINK",
                tokenAddress: 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904,
                priceFeed: 0xc2e2848e28B9fE430Ab44F55a8437a33802a219C
            })
        );

        NATIVE_TOKEN_ADDRESS = address(0);
        USDC = ERC20(0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582);
        WETH = WETH9(payable(address(0)));
    }
}
