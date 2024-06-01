import prisma from "@/lib/db";
import { authedUserProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateRandomDigits } from "@/lib/utils";
import { send2FARequestedEmail } from "@/lib/nodemailer";

export const transactionsRouter = router({
  getPausedTransactions: authedUserProcedure.query(async ({ ctx }) => {
    const pausedTxns = await prisma.transaction.findMany({
      where: {
        wallet: { ownerId: ctx.session.user.id },
        isPaused: true,
      },
    });

    return pausedTxns;
  }),

  recordNewTransaction: authedUserProcedure
    .input(
      z.object({
        target: z.string(),
        value: z.bigint(),
        data: z.string(),
        nonce: z.bigint(),
        pausedNonce: z.bigint().nullish(),
        isPaused: z.boolean().default(false),
        isSuccess: z.boolean().default(false),
        isFailed: z.boolean().default(false),
        walletId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await prisma.wallet.findUnique({
        where: { id: input.walletId },
        include: { owner: { select: { email: true } } },
      });

      if (!wallet) throw new Error("Wallet not found");
      if (!wallet.owner.email) throw new Error("Wallet owner email not found");

      if (wallet.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const generate2FA = input.isPaused === true;
      const twoFactorCode = generateRandomDigits(6);

      if (generate2FA) {
        await send2FARequestedEmail(
          wallet.owner.email,
          twoFactorCode,
          "TODO APPROVAL LINK"
        );
      }

      await prisma.transaction.create({
        data: {
          target: input.target,
          value: input.value,
          data: input.data,
          nonce: input.nonce,
          pausedNonce: input.pausedNonce,
          isPaused: input.isPaused,
          isSuccess: input.isSuccess,
          isFailed: input.isFailed,
          walletId: input.walletId,
          twoFactorCode: generate2FA ? twoFactorCode : null,
        },
      });
    }),
});
