import { Chain } from "@prisma/client";

type ContractAddresses = {
  entrypointAddress: `0x${string}`;
  factoryAddress: `0x${string}`;
  paymasterAddress: `0x${string}`;
  feedsRegistryAddress: `0x${string}`;
  functionsConsumerAddress: `0x${string}`;
  guardianAddress: `0x${string}`;
};

export const ContractAddressesByChain: Record<Chain, ContractAddresses> = {
  [Chain.SEPOLIA]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factoryAddress: "0x6540392ce7b5188455d952c7fbbe2026c120b598",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0x8035ddce5e7034613d548dd6b3d95e24b2449bd5",
    feedsRegistryAddress: "0xc6a2d5012c6c1ea900fe19f2bff7e3d60ec4e244",
    functionsConsumerAddress: "0xfb8c5000debe39d322ab79b07f5da16059332693",
  },
  [Chain.ARBITRUM_SEPOLIA]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factoryAddress: "0x123f688138dce1367d52e680f2c52927eb31e35f",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    paymasterAddress: "0x46aac02846f762d97a055be664bd51f4c1b71aae",
    feedsRegistryAddress: "0x98e72076585e0903af550d6f12a310def6e0ddcd",
    functionsConsumerAddress: "0x2194506a15ecd21c0bb673bb34ec19539c898bfb",
  },
  [Chain.AVALANCHE_FUJI]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    factoryAddress: "0x15b4b884d6202331524a875899ac9ba2f365e2de",
    paymasterAddress: "0x5e9fa6be96ca9b78a09ed312a37f2d418c770225",
    feedsRegistryAddress: "0x659a7a868b5b0b4cb39af815a1fca0cd01dde97e",
    functionsConsumerAddress: "0x3095ebad7c9498474c50329f4aeb54f54dc545ec",
  },
  [Chain.SCROLL_SEPOLIA]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    feedsRegistryAddress: "0x123f688138dce1367d52e680f2c52927eb31e35f",
    functionsConsumerAddress: "0x0000000000000000000000000000000000000000",
    paymasterAddress: "0x03eefe27a55f37e4279b213da2c3be5ab18390b1",
    factoryAddress: "0x0e6b968c5f26176ff50adb96fe36140b7d31f6ca",
  },
  [Chain.POLYGON_AMOY]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",
    feedsRegistryAddress: "0x82a52ad8560443276bb2aa384f114db520292efe",
    functionsConsumerAddress: "0x1cf951d7c653707b13c11f2805f4ca34ac6d8a8d",
    paymasterAddress: "0x6591339cc078a7f9f0ccf5958ff387c236ae4899",
    factoryAddress: "0x659a7a868b5b0b4cb39af815a1fca0cd01dde97e",
  },
};
