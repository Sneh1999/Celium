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

    feedsRegistryAddress: "0x647Cb897B78dDb8bfbABB453b9a87C2Bd8f9CBBd.",
    functionsConsumerAddress: "0x4f0a504C55De67b1Fa75937082C482236CC5de0D",
    paymasterAddress: "0xA0a43467DD61cfb939495d5438Cb9392bA7EDb36",
    factoryAddress: "0x143e4E22D6Be32d2283d14ffd13CC5b21954910d",
  },
  [Chain.ARBITRUM_SEPOLIA]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",

    feedsRegistryAddress: "0x5b7A96C3950ee35145290557E93841E44eB70304",
    functionsConsumerAddress: "0x19cFd1d40734ed204d53E884f955DCb3D1279523",
    paymasterAddress: "0x19f0d306470a04331A460C200771Cb67887CD569",
    factoryAddress: "0x65fA70d457fe07f3639dda84dBBB272A91E4dB6c",
  },
  [Chain.AVALANCHE_FUJI]: {
    entrypointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    guardianAddress: "0x79fd1DCC5B3479379c33868c402b23b7b35e77D2",

    feedsRegistryAddress: "0x5b7A96C3950ee35145290557E93841E44eB70304",
    functionsConsumerAddress: "0x19cFd1d40734ed204d53E884f955DCb3D1279523",
    paymasterAddress: "0x19f0d306470a04331A460C200771Cb67887CD569",
    factoryAddress: "0x65fA70d457fe07f3639dda84dBBB272A91E4dB6c",
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

    feedsRegistryAddress: "0x5e9fa6be96ca9b78a09ed312a37f2d418c770225",
    functionsConsumerAddress: "0xa6ade2b6bae21c0cbf38f4dcf149982b8c31e8c4",
    paymasterAddress: "0x115e2a5fa7e7cb990de6607564a6b444f6303d59",
    factoryAddress: "0xa007dd2f6015f2fc29b4873b0a06e49170a70bbe",
  },
};
