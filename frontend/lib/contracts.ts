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
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",

    feedsRegistryAddress: "0x54992c5eecd0a8e361a81227b8580ac88863bc52",
    functionsConsumerAddress: "0xa8d6dcfcdf83254b275945a9af7d62a26a9c2b49",
    paymasterAddress: "0x6be2887887c2fff9cfcb2b274526d157420c44da",
    factoryAddress: "0x8bdd58a6ec5d2f5271605ea2f53f0de20c04f3ef",
  },
  [Chain.ARBITRUM_SEPOLIA]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",

    feedsRegistryAddress: "0x659a7a868b5b0b4cb39af815a1fca0cd01dde97e",
    functionsConsumerAddress: "0x0e6b968c5f26176ff50adb96fe36140b7d31f6ca",
    paymasterAddress: "0x6fbf232cb7aabd2757a85e76a4e611c0cc4a87f2",
    factoryAddress: "0x1cf951d7c653707b13c11f2805f4ca34ac6d8a8d",
  },
  [Chain.AVALANCHE_FUJI]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",

    feedsRegistryAddress: "0x659a7a868b5b0b4cb39af815a1fca0cd01dde97e",
    functionsConsumerAddress: "0x3095ebad7c9498474c50329f4aeb54f54dc545ec",
    paymasterAddress: "0x5e9fa6be96ca9b78a09ed312a37f2d418c770225",
    factoryAddress: "0x15b4b884d6202331524a875899ac9ba2f365e2de",
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
