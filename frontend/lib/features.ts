import { ChainNames } from "./chains";

type AvailableFeaturesPerChain = {
  priceFeeds: boolean;
  functions: boolean;
  uniswapv3: boolean;
  ccip: boolean;
};

export const ChainFeatures: Record<ChainNames, AvailableFeaturesPerChain> = {
  anvil: {
    priceFeeds: true,
    functions: false,
    uniswapv3: true,
    ccip: true,
  },
  sepolia: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
  arbitrum_sepolia: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
  base_sepolia: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
  avalanche_fuji: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
  zksync_sepolia: {
    priceFeeds: true,
    functions: false,
    uniswapv3: true,
    ccip: false,
  },
  scroll_sepolia: {
    priceFeeds: true,
    functions: false,
    uniswapv3: true,
    ccip: false,
  },
  polygon_amoy: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
};
