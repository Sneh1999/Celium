import { WalletABI } from "@/abis/Wallet.abi";
import { getViemChainFromChainName } from "@/lib/chains";
import prisma from "@/lib/db";
import { send2FARequestedEmail } from "@/lib/nodemailer";
import { generateRandomDigits } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { Hex, createPublicClient, http } from "viem";
import { readContract } from "viem/actions";

type Request2FARequest = {
  walletAddress: Hex;
  pausedNonce: Hex;
  walletNonce: Hex;
  chainId: Hex;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let { walletAddress, pausedNonce, walletNonce, chainId } = JSON.parse(
    req.body as string
  ) as Request2FARequest;

  const missing = [];

  if (!walletAddress) {
    missing.push("walletAddress");
  }

  if (!pausedNonce) {
    missing.push("pausedNonce");
  }

  if (!walletNonce) {
    missing.push("walletNonce");
  }

  if (!chainId) {
    missing.push("chainId");
  }

  if (missing.length > 0) {
    res.status(400).json({ error: `Missing ${missing.join(", ")} parameter` });
    return;
  }

  const wallet = await prisma.wallet.findFirst({
    where: { address: walletAddress.toLowerCase() },
    include: { owner: { select: { email: true } } },
  });

  if (!wallet) {
    res.status(400).json({ error: "Wallet not found" });
    return;
  }

  if (!wallet.owner.email) {
    res.status(400).json({ error: "Wallet owner email not found" });
    return;
  }

  const nonce = BigInt(walletNonce) - BigInt(1);

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      wallet: { address: walletAddress.toLowerCase() },
      nonce,
    },
  });

  if (existingTransaction && existingTransaction.isPaused) {
    return res.json({ success: true });
  }

  const twoFactorCode = generateRandomDigits(6);

  if (existingTransaction) {
    await prisma.transaction.update({
      where: { id: existingTransaction.id },
      data: { isPaused: true, pausedNonce: BigInt(pausedNonce), twoFactorCode },
    });

    await send2FARequestedEmail(
      wallet.owner.email,
      twoFactorCode,
      `${process.env.NEXTAUTH_URL}/tx/${wallet.id}/${walletNonce}`
    );
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
        args: [BigInt(pausedNonce)],
      }
    );

    const [target, value, data] = txnDetails;

    await prisma.transaction.upsert({
      where: {
        walletId_nonce: {
          walletId: wallet.id,
          nonce: nonce,
        },
      },
      create: {
        target: target.toLowerCase(),
        value: value,
        data: data,
        nonce: nonce,
        pausedNonce: BigInt(pausedNonce),
        twoFactorCode,
        isPaused: true,
        wallet: { connect: { address: walletAddress.toLowerCase() } },
      },
      update: {
        isPaused: true,
        twoFactorCode,
        pausedNonce: BigInt(pausedNonce),
      },
    });

    await send2FARequestedEmail(
      wallet.owner.email,
      twoFactorCode,
      `${process.env.NEXTAUTH_URL}/tx/${wallet.id}/${walletNonce}`
    );
  }

  return res.json({ success: true });
}
