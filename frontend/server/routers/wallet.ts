import { chainNameSchema, getViemChainFromChainName } from "@/lib/chains";
import prisma from "@/lib/db";
import { createPublicClient, http } from "viem";
import { readContract } from "viem/actions";
import { z } from "zod";
import { authedUserProcedure, router } from "../trpc";
import { Chain, Wallet } from "@prisma/client";
import { ContractAddressesByChain } from "@/lib/contracts";
import { WalletFactoryABI } from "@/abis/WalletFactory.abi";
import { TokenInfo, getTokenBalancesForWallet } from "@/lib/tokens";

export const walletRouter = router({
  getWallets: authedUserProcedure.query(async ({ ctx }) => {
    const allWallets = await prisma.wallet.findMany({
      where: {
        ownerId: ctx.session.user.id,
      },
      include: {
        _count: {
          select: { transactions: true },
        },
        transactions: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: { createdAt: true },
        },
      },
    });

    type WalletWithTokenInfo = (typeof allWallets)[number] & {
      tokenInfo: TokenInfo[];
    };

    const walletsWithTokenInfo: WalletWithTokenInfo[] = [];

    for (const wallet of allWallets) {
      const tokenInfo = await getTokenBalancesForWallet(wallet);
      walletsWithTokenInfo.push({ ...wallet, tokenInfo });
    }

    return walletsWithTokenInfo;
  }),

  createNewWallet: authedUserProcedure
    .input(
      z.object({
        name: z.string(),
        chainName: chainNameSchema,
        maxUSDAmountAllowed: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const viemChain = getViemChainFromChainName(input.chainName);
      const publicClient = createPublicClient({
        chain: viemChain,
        transport: http(),
      });

      const factoryAddress =
        ContractAddressesByChain[input.chainName].factoryAddress;

      const salt = Math.floor(Math.random() * 1_000_000);
      const computedWalletAddress = (await readContract(publicClient, {
        address: factoryAddress,
        abi: WalletFactoryABI,
        functionName: "getAddress",
        args: [
          ctx.session.user.address as `0x${string}`,
          process.env.NEXT_PUBLIC_GUARDIAN_ADDRESS,
          BigInt(salt),
          BigInt(input.maxUSDAmountAllowed),
        ],
      })) as string;

      await prisma.wallet.create({
        data: {
          name: input.name,
          address: computedWalletAddress,
          maxUSDAmountAllowed: input.maxUSDAmountAllowed,
          salt,
          isDeployed: false,
          chain: input.chainName.toUpperCase() as Chain,
          ownerId: ctx.session.user.id,
        },
      });
    }),
});
