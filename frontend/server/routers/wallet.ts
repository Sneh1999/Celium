import {
  ChainNamesToChainEnum,
  chainNameSchema,
  getViemChainFromChainName,
} from "@/lib/chains";
import prisma from "@/lib/db";
import { createPublicClient, http } from "viem";
import { readContract } from "viem/actions";
import { z } from "zod";
import { abi as WalletFactoryABI } from "../../../contracts/out/WalletFactory.sol/WalletFactory.json" assert { type: "json" };
import { authedUserProcedure, router } from "../trpc";

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

    return allWallets;
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

      const computedWalletAddress = (await readContract(publicClient, {
        address: process.env.NEXT_PUBLIC_WALLET_FACTORY_ADDRESS,
        abi: WalletFactoryABI,
        functionName: "getAddress",
        args: [
          ctx.session.user.address,
          process.env.NEXT_PUBLIC_GUARDIAN_ADDRESS,
          0,
          input.maxUSDAmountAllowed,
        ],
      })) as string;

      await prisma.wallet.create({
        data: {
          name: input.name,
          address: computedWalletAddress,
          maxUSDAmountAllowed: input.maxUSDAmountAllowed,
          isDeployed: false,
          chain: ChainNamesToChainEnum[input.chainName],
          ownerId: ctx.session.user.id,
        },
      });
    }),
});
