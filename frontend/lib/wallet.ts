import { WalletClient } from "viem";

import { abi as WalletFactoryABI } from "../../contracts/out/WalletFactory.sol/WalletFactory.json" assert { type: "json" };

interface CreateNewWalletParams {
  ownerAddress: `0x${string}`;
  maxUSDAmountAllowed: number;
  walletClient: WalletClient;
}

export async function createWalletAccount({
  ownerAddress,
  maxUSDAmountAllowed,
  walletClient,
}: CreateNewWalletParams) {
  const txnHash = await walletClient.writeContract({
    address: process.env.NEXT_PUBLIC_WALLET_FACTORY_ADDRESS,
    abi: WalletFactoryABI,
    functionName: "createAccount",
    args: [
      ownerAddress,
      process.env.NEXT_PUBLIC_GUARDIAN_ADDRESS,
      0,
      maxUSDAmountAllowed,
    ],
    account: ownerAddress,
    chain: walletClient.chain!,
  });

  return txnHash;
}
