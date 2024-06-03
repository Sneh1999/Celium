export const WalletABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "anEntryPoint",
        type: "address",
        internalType: "contract IEntryPoint",
      },
      {
        name: "ourWalletFactory",
        type: "address",
        internalType: "address",
      },
      {
        name: "_feedsRegistry",
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
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "addDeposit",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "approveTransaction",
    inputs: [
      {
        name: "pausedNonce",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "approveSignature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "bridge",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_destinationChainSelector",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burnPoints",
    inputs: [
      {
        name: "_points",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "entryPoint",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IEntryPoint",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "execute",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getNonce",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "guardian",
    inputs: [],
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
    name: "initialize",
    inputs: [
      {
        name: "_owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "_guardian",
        type: "address",
        internalType: "address",
      },
      {
        name: "_maxAmountAllowed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
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
    name: "pausedTransactions",
    inputs: [
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "points",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "swapAndBridge",
    inputs: [
      {
        name: "tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountOutMin",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "path",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "_destinationChainSelector",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "validateUserOp",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct UserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "verificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxFeePerGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxPriorityFeePerGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "userOpHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "missingAccountFunds",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "validationData",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "walletFactory",
    inputs: [],
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
    type: "event",
    name: "ChainlinkDataFeedNotFound",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokensTransferred",
    inputs: [
      {
        name: "messageId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "destinationChainSelector",
        type: "uint64",
        indexed: true,
        internalType: "uint64",
      },
      {
        name: "receiver",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "feeToken",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "fees",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TwoFactorAuthRequired",
    inputs: [
      {
        name: "pausedNonce",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WalletInitialized",
    inputs: [
      {
        name: "entryPoint",
        type: "address",
        indexed: true,
        internalType: "contract IEntryPoint",
      },
      {
        name: "owner",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "guardian",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "maxAmountAllowed",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "GuardianSignatureVerificationFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPausedTransactionNonce",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidReceiverAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "NotEnoughBalance",
    inputs: [
      {
        name: "currentBalance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "calculatedFees",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "NotEntrypointOrFactory",
    inputs: [],
  },
  {
    type: "error",
    name: "NotPaymaster",
    inputs: [],
  },
  {
    type: "error",
    name: "NotSelf",
    inputs: [],
  },
] as const;
