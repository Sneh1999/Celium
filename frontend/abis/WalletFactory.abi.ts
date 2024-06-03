export const WalletFactoryABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "entryPoint",
        type: "address",
        internalType: "contract IEntryPoint",
      },
      {
        name: "feedsRegistry",
        type: "address",
        internalType: "address",
      },
      {
        name: "_consumer",
        type: "address",
        internalType: "address",
      },
      {
        name: "_universalRouter",
        type: "address",
        internalType: "contract IUniversalRouter",
      },
      {
        name: "ccipRouter",
        type: "address",
        internalType: "contract IRouterClient",
      },
      {
        name: "_native",
        type: "address",
        internalType: "address",
      },
      {
        name: "_nativeTokenDecimals",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "_paymaster",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "consumer",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract Consumer",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createAccount",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "guardian",
        type: "address",
        internalType: "address",
      },
      {
        name: "salt",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxAmountAllowed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract Wallet",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAddress",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "guardian",
        type: "address",
        internalType: "address",
      },
      {
        name: "salt",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxAmountAllowed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "walletImplementation",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract Wallet",
      },
    ],
    stateMutability: "view",
  },
] as const;
