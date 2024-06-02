import { WalletABI } from "@/abis/Wallet.abi";
import { WalletFactoryABI } from "@/abis/WalletFactory.abi";
import { Wallet } from "@prisma/client";
import { V06 } from "userop";
import { WalletClient, createPublicClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  getBundlerPublicClientFromChainName,
  getViemChainFromChainName,
} from "./chains";
import { ContractAddressesByChain } from "./contracts";

interface GetAccountInstanceOpts {
  wallet: Wallet;
  ownerAddress: `0x${string}`;
  walletClient: WalletClient;
  usePaymaster?: boolean;
}

export async function getAccountInstance(opts: GetAccountInstanceOpts) {
  const account = new V06.Account.Instance({
    accountAbi: WalletABI,
    factoryAbi: WalletFactoryABI,
    factoryAddress: ContractAddressesByChain[opts.wallet.chain].factoryAddress,
    ethClient: createPublicClient({
      chain: getViemChainFromChainName(opts.wallet.chain),
      transport: http(),
    }),
    bundlerClient: getBundlerPublicClientFromChainName(opts.wallet.chain),
    entryPointAddress:
      ContractAddressesByChain[opts.wallet.chain].entrypointAddress,
    setFactoryData: async (_salt, encoder) => {
      return encoder("createAccount", [
        opts.ownerAddress,
        ContractAddressesByChain[opts.wallet.chain].guardianAddress,
        BigInt(opts.wallet.salt),
        BigInt(opts.wallet.maxUSDAmountAllowed), // TODO: MAX AMOUNT ALLOWED
      ]);
    },
    requestSignature: async (type, message) => {
      const dummy = privateKeyToAccount(generatePrivateKey());
      if (type === "dummy") {
        return dummy.signMessage({ message });
      }

      return await opts.walletClient.signMessage({
        account: opts.ownerAddress,
        message,
      });
    },
    requestPaymaster: async (userOp, entrypoint) => {
      if (!opts.usePaymaster) {
        return {
          paymasterAndData: "0x",
        };
      }

      // TODO: ADD PAYMASTER

      return {
        paymasterAndData: "0x",
      };
    },
  });

  account.setSalt(BigInt(opts.wallet.salt));

  return account;
}
