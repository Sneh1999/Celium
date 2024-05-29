import { PublicClient, WalletClient, createPublicClient, http } from "viem";
import { V06 } from "userop";
import { WalletABI } from "@/abis/Wallet.abi";
import { WalletFactoryABI } from "@/abis/WalletFactory.abi";
import { ContractAddressesByChain } from "./contracts";
import { ChainNames, getViemChainFromChainName } from "./chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

interface GetAccountInstanceOpts {
  chainName: ChainNames;
  ownerAddress: `0x${string}`;
  walletClient: WalletClient;
  salt: bigint;
  usePaymaster?: boolean;
}

export async function getAccountInstance(opts: GetAccountInstanceOpts) {
  const account = new V06.Account.Instance({
    accountAbi: WalletABI,
    factoryAbi: WalletFactoryABI,
    factoryAddress: ContractAddressesByChain[opts.chainName].factoryAddress,
    // @ts-expect-error: Weird viem version mismatch stuff that doesn't affect anything
    ethClient: createPublicClient({
      chain: getViemChainFromChainName(opts.chainName),
      transport: http(),
    }),
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

  account.setSalt(opts.salt);

  return account;
}
