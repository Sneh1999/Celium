import { anvil, arbitrumSepolia, sepolia } from "viem/chains";
import { z } from "zod";

export const chainNameSchema = z.union([
  z.literal("anvil"),
  z.literal("sepolia"),
  z.literal("arbitrum_sepolia"),
]);

export type ChainNames = z.infer<typeof chainNameSchema>;

export function getViemChainFromChainName(chainName: ChainNames) {
  if (chainName === "anvil") {
    return anvil;
  }

  if (chainName === "sepolia") {
    return sepolia;
  }

  if (chainName === "arbitrum_sepolia") {
    return arbitrumSepolia;
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
];
