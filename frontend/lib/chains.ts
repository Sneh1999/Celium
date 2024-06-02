import { Chain } from "@prisma/client";
import { createPublicClient, http } from "viem";
import {
  arbitrumSepolia,
  avalancheFuji,
  polygonAmoy,
  scrollSepolia,
  sepolia,
} from "viem/chains";
import { z } from "zod";

export const chainNameSchema = z.nativeEnum(Chain);

const VIEM_CHAINS = {
  [Chain.SEPOLIA]: sepolia,
  [Chain.ARBITRUM_SEPOLIA]: arbitrumSepolia,
  [Chain.AVALANCHE_FUJI]: avalancheFuji,
  [Chain.SCROLL_SEPOLIA]: scrollSepolia,
  [Chain.POLYGON_AMOY]: polygonAmoy,
} as const;

const BUNDLER_CLIENTS = {
  [Chain.SEPOLIA]: createPublicClient({
    chain: sepolia,
    transport: http("https://public.stackup.sh/api/v1/node/ethereum-sepolia"),
  }),
  [Chain.ARBITRUM_SEPOLIA]: createPublicClient({
    chain: arbitrumSepolia,
    transport: http("https://public.stackup.sh/api/v1/node/arbitrum-sepolia"),
  }),
  [Chain.AVALANCHE_FUJI]: createPublicClient({
    chain: avalancheFuji,
    transport: http("https://public.stackup.sh/api/v1/node/avalanche-fuji"),
  }),
  [Chain.SCROLL_SEPOLIA]: createPublicClient({
    chain: scrollSepolia,
    transport: http(
      "https://api.pimlico.io/v2/534351/rpc?apikey=64de3adb-692a-4dbc-aa33-4d53ea26b648"
    ),
  }),
  [Chain.POLYGON_AMOY]: createPublicClient({
    chain: polygonAmoy,
    transport: http("https://amoy.voltaire.candidewallet.com/rpc"),
  }),
} as const;

export function getViemChainFromChainName(chainName: Chain) {
  const viemChain = VIEM_CHAINS[chainName];
  return viemChain;
}

export function getBundlerPublicClientFromChainName(chainName: Chain) {
  const bundlerClient = BUNDLER_CLIENTS[chainName];
  return bundlerClient;
}

export const ChainData: {
  chain: Chain;
  fullName: string;
  imageUrl: string;
}[] = [
  {
    chain: Chain.SEPOLIA,
    fullName: "Sepolia",
    imageUrl:
      "https://cryptologos.cc/logos/versions/ethereum-eth-logo-diamond.svg?v=032",
  },
  {
    chain: Chain.ARBITRUM_SEPOLIA,
    fullName: "Arbitrum Sepolia",
    imageUrl: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=032",
  },
  {
    chain: Chain.AVALANCHE_FUJI,
    fullName: "Avalanche Fuji",
    imageUrl: "https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=032",
  },
  {
    chain: Chain.SCROLL_SEPOLIA,
    fullName: "Scroll Sepolia",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1696531511519150080/Fq5O0LeN_400x400.jpg",
  },
  {
    chain: Chain.POLYGON_AMOY,
    fullName: "Polygon Amoy",
    imageUrl: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=032",
  },
];
