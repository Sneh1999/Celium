import { ChainNames } from "./chains";

type ContractAddresses = {
  factoryAddress: `0x${string}`;
  entrypointAddress: `0x${string}`;
  guardianAddress: `0x${string}`;
  paymasterAddress: `0x${string}`;
};

export const ContractAddressesByChain: Record<ChainNames, ContractAddresses> = {
  anvil: {
    factoryAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
    entrypointAddress: "0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
  },
  sepolia: {
    factoryAddress: "0x520ceaf62Da1cFE9E98279e3559F6e8bAF43f7E7",
    entrypointAddress: "0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
  },
  arbitrum_sepolia: {
    factoryAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
    entrypointAddress: "0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
  },
  base_sepolia: {
    factoryAddress: "0xF369CB5209dA8F59e78efe3a8B3f8ccEe7428c5A",
    entrypointAddress: "0x635A86F9fdD16Ff09A0701C305D3a845F1758b8E",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
  },
  avalanche_fuji: {
    factoryAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
    entrypointAddress: "0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
  },
  zksync_sepolia: {
    factoryAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
    entrypointAddress: "0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
  },
  scroll_sepolia: {
    factoryAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
    entrypointAddress: "0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
  },
  polygon_amoy: {
    factoryAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
    entrypointAddress: "0xcAc30D6Dc9bEED0D31699c059ceD50d0b8279aeF",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0xf99F35d284675D594Cf0dda5C7B8979Df947e134",
  },
};
