import { WalletABI } from "@/abis/Wallet.abi";
import { getViemChainFromChainName } from "@/lib/chains";
import prisma from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, http } from "viem";
import { readContract } from "viem/actions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address: walletAddress } = req.query;

  // TODO: Get nonce and pausedNonce from somewhere
  const nonce = BigInt(1);
  const pausedNonce = BigInt(1);

  if (!walletAddress || typeof walletAddress !== "string") {
    res.status(400).json({ error: "Missing address parameter" });
    return;
  }

  if (!nonce) {
    res.status(400).json({ error: "Missing nonce parameter" });
    return;
  }

  const wallet = await prisma.wallet.findFirst({
    where: { address: walletAddress.toLowerCase() },
  });

  if (!wallet) {
    res.status(400).json({ error: "Wallet not found" });
    return;
  }

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      wallet: { address: walletAddress.toLowerCase() },
      nonce: nonce,
    },
  });

  if (existingTransaction && existingTransaction.isPaused) {
    // We've already handled this before. Let it be
    return res.json({ success: true });
  }

  if (existingTransaction) {
    await prisma.transaction.update({
      where: { id: existingTransaction.id },
      data: { isPaused: true },
    });
  }

  if (!existingTransaction) {
    const txnDetails = await readContract(
      createPublicClient({
        chain: getViemChainFromChainName(wallet.chain),
        transport: http(),
      }),
      {
        abi: WalletABI,
        address: walletAddress as `0x${string}`,
        functionName: "pausedTransactions",
        args: [pausedNonce],
      }
    );

    const [target, value, data] = txnDetails;

    await prisma.transaction.create({
      data: {
        target: target.toLowerCase(),
        value: value,
        data: data,
        nonce: nonce,
        isPaused: true,
        wallet: { connect: { address: walletAddress.toLowerCase() } },
      },
    });
  }

  // TODO: SEND EMAIL TO WALLET OWNER

  return res.json({ success: true });
}
