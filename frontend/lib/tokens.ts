import { Chain, Wallet } from "@prisma/client";
import { getViemChainFromChainName } from "./chains";
import { createPublicClient, erc20Abi, http } from "viem";

interface Token {
  symbol: string;
  decimals: number;
  imageUrl: string;
}

interface TokenOnChain extends Token {
  address: `0x${string}`;
  isNative: boolean;
}

const ETH: Token = {
  symbol: "ETH",
  decimals: 18,
  imageUrl:
    "https://cryptologos.cc/logos/versions/ethereum-eth-logo-diamond.svg?v=032",
};

const WETH: Token = {
  symbol: "WETH",
  decimals: 18,
  imageUrl:
    "https://cryptologos.cc/logos/versions/ethereum-eth-logo-diamond.svg?v=032",
};

const USDC: Token = {
  symbol: "USDC",
  decimals: 6,
  imageUrl:
    "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
};

const CCIPBnM: Token = {
  symbol: "CCIPBnM",
  decimals: 18,
  imageUrl:
    "https://assets-global.website-files.com/5f6b7190899f41fb70882d08/648c8655667959beb00b4a76_icon-product_ccip.svg",
};

const AVAX: Token = {
  symbol: "AVAX",
  decimals: 18,
  imageUrl:
    "https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png?1547032395",
};

const MATIC: Token = {
  symbol: "MATIC",
  decimals: 18,
  imageUrl:
    "https://assets.coingecko.com/coins/images/271/large/matic-token-icon.png?1547032395",
};

const AnvilTokens: TokenOnChain[] = [
  {
    ...ETH,
    address: "0x0000000000000000000000000000000000000000",
    isNative: true,
  },
];

const SepoliaTokens: TokenOnChain[] = [
  {
    ...ETH,
    address: "0x0000000000000000000000000000000000000000",
    isNative: true,
  },
  {
    ...USDC,
    address: "0xf08A50178dfcDe18524640EA6618a1f965821715",
    isNative: false,
  },
  {
    ...WETH,
    address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    isNative: false,
  },
];

const ArbitrumSepoliaTokens: TokenOnChain[] = [
  {
    ...ETH,
    address: "0x0000000000000000000000000000000000000000",
    isNative: true,
  },
];

const BaseSepoliaTokens: TokenOnChain[] = [
  {
    ...ETH,
    address: "0x0000000000000000000000000000000000000000",
    isNative: true,
  },
];

const ZkSyncSepoliaTokens: TokenOnChain[] = [
  {
    ...ETH,
    address: "0x0000000000000000000000000000000000000000",
    isNative: true,
  },
];

const ScrollSepoliaTokens: TokenOnChain[] = [
  {
    ...ETH,
    address: "0x0000000000000000000000000000000000000000",
    isNative: true,
  },
];

const AvalancheFujiTokens: TokenOnChain[] = [
  {
    ...AVAX,
    address: "0x0000000000000000000000000000000000000000",
    isNative: true,
  },
];

const PolygonAmoyTokens: TokenOnChain[] = [
  {
    ...MATIC,
    address: "0x0000000000000000000000000000000000000000",
    isNative: true,
  },
];

export const TokensByChain: Record<Chain, TokenOnChain[]> = {
  [Chain.ANVIL]: AnvilTokens,
  [Chain.SEPOLIA]: SepoliaTokens,
  [Chain.ARBITRUM_SEPOLIA]: ArbitrumSepoliaTokens,
  [Chain.AVALANCHE_FUJI]: AvalancheFujiTokens,
  [Chain.BASE_SEPOLIA]: BaseSepoliaTokens,
  [Chain.SCROLL_SEPOLIA]: ScrollSepoliaTokens,
  [Chain.POLYGON_AMOY]: PolygonAmoyTokens,
};

export interface TokenInfo extends TokenOnChain {
  balance: bigint;
  usdPrice: number;
}

export async function getTokenBalancesForWallet(wallet: Wallet) {
  const supportedTokens = TokensByChain[wallet.chain];

  const promises: Promise<TokenInfo>[] = [];

  for (const token of supportedTokens) {
    const publicClient = createPublicClient({
      chain: getViemChainFromChainName(wallet.chain),
      transport: http(),
    });

    if (token.isNative) {
      promises.push(
        publicClient
          .getBalance({
            address: wallet.address as `0x${string}`,
          })
          .then((balance) => {
            return {
              ...token,
              balance,
              usdPrice: 0,
            };
          })
      );
    } else {
      promises.push(
        publicClient
          .readContract({
            abi: erc20Abi,
            address: token.address,
            functionName: "balanceOf",
            args: [wallet.address as `0x${string}`],
          })
          .then((balance) => {
            return {
              ...token,
              balance: BigInt(balance),
              usdPrice: 0,
            };
          })
      );
    }
  }

  const tokenInfos = await Promise.all(promises);
  return tokenInfos;
}
