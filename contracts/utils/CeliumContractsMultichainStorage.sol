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
    string[] CHAIN_OPTIONS =
        ["SEPOLIA", "ARBITRUM_SEPOLIA", "BASE_SEPOLIA", "AVALANCHE_FUJI", "SCROLL_SEPOLIA", "POLYGON_AMOY", "ALL"];

    string SELECT_CHAIN_PROMPT =
        "Select chain to deploy on: SEPOLIA, ARBITRUM_SEPOLIA, BASE_SEPOLIA, AVALANCHE_FUJI, SCROLL_SEPOLIA, POLYGON_AMOY, ALL";

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
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("BASE_SEPOLIA"))) {
            return "https://avatar.tobalaba.eth/rpc";
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
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("ARBITRUM_SEPOLIA"))) {}
        else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("BASE_SEPOLIA"))) {} else if (
            keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("AVALANCHE_FUJI"))
        ) {} else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("SCROLL_SEPOLIA"))) {}
        else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("POLYGON_AMOY"))) {}

        require(false, "Invalid selectedChain parameter");
    }

    function deployOurContracts(string memory selectedChain) internal {
        if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("SEPOLIA"))) {
            return _deploySepoliaContracts();
        } else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("ARBITRUM_SEPOLIA"))) {}
        else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("BASE_SEPOLIA"))) {} else if (
            keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("AVALANCHE_FUJI"))
        ) {} else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("SCROLL_SEPOLIA"))) {}
        else if (keccak256(abi.encodePacked(selectedChain)) == keccak256(abi.encodePacked("POLYGON_AMOY"))) {}

        require(false, "Invalid selectedChain parameter");
    }

    function _initializeStorageForSepolia() private {
        // External Contracts
        ENTRYPOINT = IEntryPoint(payable(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
        UNIVERSAL_ROUTER = IUniversalRouter(0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD);
        CCIP_ROUTER = IRouterClient(0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59);

        // Chainlink Functions Parameters
        FUNCTIONS_ROUTER = IFunctionsRouter(0xb83E47C2bC239B3bf370bc41e1459A34b41238D0);
        CF_SUBSCRIPTION_ID = 2760;
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
                name: "GHO",
                tokenAddress: 0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D,
                priceFeed: 0x635A86F9fdD16Ff09A0701C305D3a845F1758b8E
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
                name: "SNX",
                tokenAddress: 0x236f697c518b7AEc0bb227d8B7547b3c27cA29bc,
                priceFeed: 0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC
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

    function _deploySepoliaContracts() private {
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
}
