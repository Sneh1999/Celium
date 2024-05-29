import { PublicClient, WalletClient } from "viem";
import { V06 } from "userop";
import { WalletABI } from "@/abis/Wallet.abi";
import { WalletFactoryABI } from "@/abis/WalletFactory.abi";
import { ContractAddressesByChain } from "./contracts";
import { ChainNames } from "./chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

interface GetAccountInstanceOpts {
  chainName: ChainNames;
  ownerAddress: `0x${string}`;
  publicClient: PublicClient;
  walletClient: WalletClient;
  usePaymaster?: boolean;
}

export async function getAccountInstance(opts: GetAccountInstanceOpts) {
  const account = new V06.Account.Instance({
    accountAbi: WalletABI,
    factoryAbi: WalletFactoryABI,
    factoryAddress: ContractAddressesByChain[opts.chainName].factoryAddress,
    ethClient: opts.publicClient,
    entryPointAddress:
      ContractAddressesByChain[opts.chainName].entrypointAddress,
    setFactoryData: async (salt, encoder) => {
      return encoder("createAccount", [
        opts.ownerAddress,
        ContractAddressesByChain[opts.chainName].guardianAddress,
        salt,
        BigInt(2_000_000), // TODO: MAX AMOUNT ALLOWED
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

  return account;
}
