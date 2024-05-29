import { Chain } from "@prisma/client";
import {
  anvil,
  arbitrumSepolia,
  avalancheFuji,
  baseSepolia,
  polygonAmoy,
  scrollSepolia,
  sepolia,
  zkSyncSepoliaTestnet,
} from "viem/chains";
import { z } from "zod";

export const chainNameSchema = z.union([
  z.literal("anvil"),
  z.literal("sepolia"),
  z.literal("arbitrum_sepolia"),
  z.literal("base_sepolia"),
  z.literal("zksync_sepolia"),
  z.literal("scroll_sepolia"),
  z.literal("avalanche_fuji"),
  z.literal("polygon_amoy"),
]);

export type ChainNames = z.infer<typeof chainNameSchema>;

export function getViemChainFromChainName(chainName: ChainNames | Chain) {
  const chainNameLower = chainName.toLowerCase();

  if (chainNameLower === "anvil") {
    return anvil;
  }

  if (chainNameLower === "sepolia") {
    return sepolia;
  }

  if (chainNameLower === "arbitrum_sepolia") {
    return arbitrumSepolia;
  }

  if (chainNameLower === "base_sepolia") {
    return baseSepolia;
  }

  if (chainNameLower === "avalanche_fuji") {
    return avalancheFuji;
  }

  if (chainNameLower === "zksync_sepolia") {
    return zkSyncSepoliaTestnet;
  }

  if (chainNameLower === "scroll_sepolia") {
    return scrollSepolia;
  }

  if (chainNameLower === "polygon_amoy") {
    return polygonAmoy;
  }

  throw new Error(`Unknown chain name: ${chainName}`);
}

export const ChainData: {
  chainName: ChainNames;
  fullName: string;
  imageUrl: string;
}[] = [
  {
    chainName: "anvil",
    fullName: "Anvil",
    imageUrl:
      "https://raw.githubusercontent.com/foundry-rs/foundry/master/.github/logo.png",
  },
  {
    chainName: "sepolia",
    fullName: "Sepolia",
    imageUrl:
      "https://cryptologos.cc/logos/versions/ethereum-eth-logo-diamond.svg?v=032",
  },
  {
    chainName: "arbitrum_sepolia",
    fullName: "Arbitrum Sepolia",
    imageUrl: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=032",
  },
  {
    chainName: "base_sepolia",
    fullName: "Base Sepolia",
    imageUrl: "https://avatars.githubusercontent.com/u/108554348?v=4",
  },
  {
    chainName: "avalanche_fuji",
    fullName: "Avalanche Fuji",
    imageUrl: "https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=032",
  },
  {
    chainName: "zksync_sepolia",
    fullName: "zkSync Sepolia",
    imageUrl:
      "https://matterlabs.gitbook.io/~gitbook/image?url=https%3A%2F%2F2804585472-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fdx1cyzjdYrq1KCp6bWjS%252Fuploads%252Fgit-blob-54371a6891b2ab290bec8875644e82b476e756c1%252Ficon_zkSync_Era.png%3Falt%3Dmedia&width=768&dpr=4&quality=100&sign=8da40d7304dcae8bd7c4e4da2731a268aa11d1a0247d3a0340a2c0d9cb3d9bd4",
  },
  {
    chainName: "scroll_sepolia",
    fullName: "Scroll Sepolia",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1696531511519150080/Fq5O0LeN_400x400.jpg",
  },
  {
    chainName: "polygon_amoy",
    fullName: "Polygon Amoy",
    imageUrl: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=032",
  },
];
