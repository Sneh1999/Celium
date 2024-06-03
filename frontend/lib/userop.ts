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
    salt: BigInt(opts.wallet.salt),
    setFactoryData: async (_salt, encoder) => {
      return encoder("createAccount", [
        opts.ownerAddress,
        ContractAddressesByChain[opts.wallet.chain].guardianAddress,
        BigInt(opts.wallet.salt),
        BigInt(opts.wallet.maxUSDAmountAllowed),
      ]);
    },
    requestSignature: async (type, message) => {
      const dummy = privateKeyToAccount(generatePrivateKey());
      if (type === "dummy") {
        return dummy.signMessage({ message });
      }

      await opts.walletClient.switchChain({
        id: getViemChainFromChainName(opts.wallet.chain).id,
      });

      return await opts.walletClient.signMessage({
        account: opts.ownerAddress,
        message: { raw: message },
      });
    },
    requestPaymaster: opts.usePaymaster
      ? async (userOp, entrypoint) => {
          return {
            paymasterAndData: "0x",
          };
        }
      : undefined,
  });

  return account;
}
