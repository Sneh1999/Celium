pragma solidity ^0.8.13;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {WETH9} from "@chainlink/local/src/shared/WETH9.sol";
import {FeedsRegistry} from "../src/FeedsRegistry.sol";
import "./Consumer.sol";

abstract contract Constants {
    // Tokens
    ERC20 USDC = ERC20(0xf08A50178dfcDe18524640EA6618a1f965821715);
    WETH9 WETH = WETH9(payable(0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14));

    // Our Contracts
    FeedsRegistry FEEDS_REGISTRY = FeedsRegistry(0x0B7f332ECeF4141B6eb314C96363E777D1Ede2a4);
    Consumer FUNCTIONS_CONSUMER = Consumer(0x15cD88eACB1E189a83Ed4D3d20233718b72FBCa9);

    // External Contracts
    EntryPoint ENTRYPOINT = EntryPoint(payable(0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF));
    address CCIP_ROUTER = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;
    address UNISWAP_UNIVERSAL_ROUTER = 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD;

    // EOAs
    address USDC_WHALE = 0x406C90A36c66A42Cb4699d4Dc46DF7af5dDEe199;

    // Chainlink Functions
    uint64 CF_SUBSCRIPTION_ID = 2760;
    bytes32 CF_DON_ID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    // Chainlink CCIP
    uint64 ARB_SEPOLIA_CHAIN_SELECTOR = 3478487238524512106;

    // RPC URLs
    string ETHEREUM_SEPOLIA_RPC_URL = "https://rpc.ankr.com/eth_sepolia";
    string ARBITRUM_SEPOLIA_RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

    address  ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint8 NATIVE_TOKEN_DECIMALS = 18;
}
