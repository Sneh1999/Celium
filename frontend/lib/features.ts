import { Chain } from "@prisma/client";

type AvailableFeaturesPerChain = {
  priceFeeds: boolean;
  functions: boolean;
  uniswapv3: boolean;
  ccip: boolean;
};

export const ChainFeatures: Record<Chain, AvailableFeaturesPerChain> = {
  [Chain.ANVIL]: {
    priceFeeds: true,
    functions: false,
    uniswapv3: true,
    ccip: true,
  },
  [Chain.SEPOLIA]: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
  [Chain.ARBITRUM_SEPOLIA]: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
  [Chain.BASE_SEPOLIA]: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
  [Chain.AVALANCHE_FUJI]: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
  [Chain.SCROLL_SEPOLIA]: {
    priceFeeds: true,
    functions: false,
    uniswapv3: true,
    ccip: false,
  },
  [Chain.POLYGON_AMOY]: {
    priceFeeds: true,
    functions: true,
    uniswapv3: true,
    ccip: true,
  },
};
