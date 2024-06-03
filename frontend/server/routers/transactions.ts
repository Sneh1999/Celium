import prisma from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { encodeAbiParameters, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { z } from "zod";
import { authedUserProcedure, router } from "../trpc";
import { generateRandomDigits } from "@/lib/utils";
import { send2FARequestedEmail } from "@/lib/nodemailer";

export const transactionsRouter = router({
  getUserTransactions: authedUserProcedure.query(async ({ ctx }) => {
    const allTransactions = await prisma.transaction.findMany({
      where: {
        wallet: { ownerId: ctx.session.user.id },
      },
      include: {
        wallet: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return allTransactions;
  }),

  getUserTransactionsByWallet: authedUserProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const allTransactions = await prisma.transaction.findMany({
        where: {
          wallet: {
            address: input.walletAddress.toLowerCase(),
            ownerId: ctx.session.user.id,
          },
        },
        include: {
          wallet: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return allTransactions;
    }),

  getUserTransactionByHash: authedUserProcedure
    .input(z.object({ hash: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await prisma.transaction.findFirst({
        where: {
          hash: input.hash.toLowerCase(),
          wallet: { ownerId: ctx.session.user.id },
        },
        include: { wallet: true },
      });

      if (!transaction) {
        return null;
      }

      return transaction;
    }),

  getUserTransactionByWalletAndNonce: authedUserProcedure
    .input(z.object({ walletId: z.number(), nonce: z.string() }))
    .query(async ({ ctx, input }) => {
      const nonce = BigInt(input.nonce);
      const transaction = await prisma.transaction.findUnique({
        where: {
          walletId_nonce: {
            walletId: input.walletId,
            nonce: nonce,
          },
          wallet: { ownerId: ctx.session.user.id },
        },
        include: { wallet: true },
      });

      if (!transaction) {
        return null;
      }

      return transaction;
    }),

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
        hash: z.string().nullish(),
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

      const twoFactorCode = generateRandomDigits(6);

      await prisma.transaction.upsert({
        where: {
          walletId_nonce: {
            walletId: input.walletId,
            nonce: BigInt(input.nonce),
          },
        },
        create: {
          hash: input.hash?.toLowerCase(),
          target: input.target.toLowerCase(),
          value: input.value,
          data: input.data,
          nonce: input.nonce,
          pausedNonce: input.pausedNonce,
          isPaused: input.isPaused,
          isSuccess: input.isSuccess,
          isFailed: input.isFailed,
          walletId: input.walletId,
          twoFactorCode: input.isPaused ? twoFactorCode : null,
        },
        update: {
          hash: input.hash?.toLowerCase(),
          target: input.target.toLowerCase(),
          value: input.value,
          data: input.data,
          nonce: input.nonce,
          pausedNonce: input.pausedNonce,
          isPaused: input.isPaused,
          isSuccess: input.isSuccess,
          isFailed: input.isFailed,
          walletId: input.walletId,
        },
      });

      if (input.isPaused) {
        await send2FARequestedEmail(
          wallet.owner.email,
          twoFactorCode,
          `${process.env.NEXTAUTH_URL}/tx/${input.walletId}/${input.nonce}`
        );
      }
    }),

  succeedPausedTransaction: authedUserProcedure
    .input(
      z.object({
        walletId: z.number(),
        pausedNonce: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pausedNonceInt = BigInt(input.pausedNonce);

      const transaction = await prisma.transaction.findFirst({
        where: {
          pausedNonce: pausedNonceInt,
          wallet: { ownerId: ctx.session.user.id },
        },
        include: { wallet: true },
      });

      if (!transaction) {
        return null;
      }

      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          isPaused: false,
          isSuccess: true,
          isFailed: false,
          isIgnored: false,
        },
      });
    }),

  ignorePausedTransaction: authedUserProcedure
    .input(
      z.object({
        hash: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transaction = await prisma.transaction.findFirst({
        where: {
          hash: input.hash.toLowerCase(),
          wallet: { ownerId: ctx.session.user.id },
        },
        include: { wallet: true },
      });

      if (!transaction) {
        return null;
      }

      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          isPaused: false,
          isIgnored: true,
        },
      });
    }),

  approvePausedTransaction: authedUserProcedure
    .input(
      z.object({
        hash: z.string(),
        twoFactorCode: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.twoFactorCode.length !== 6) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid two factor code",
        });
      }

      const transaction = await prisma.transaction.findFirst({
        where: {
          hash: input.hash.toLowerCase(),
          wallet: { ownerId: ctx.session.user.id },
        },
        include: { wallet: true },
      });

      if (!transaction) {
        return null;
      }

      if (transaction.twoFactorCode !== input.twoFactorCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid two factor code",
        });
      }

      const guardianAccount = privateKeyToAccount(
        process.env.GUARDIAN_PRIVATE_KEY
      );

      const encodedMsgToSignOver = encodeAbiParameters(
        [
          {
            name: "target",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "data",
            type: "bytes",
          },
        ],
        [
          transaction.target as `0x${string}`,
          transaction.value,
          transaction.data as `0x${string}`,
        ]
      );

      const hash = keccak256(encodedMsgToSignOver);
      const guardianSignature = await guardianAccount.signMessage({
        message: hash,
      });

      return guardianSignature;
    }),
});
