import prisma from "@/lib/db";
import { authedUserProcedure, router } from "../trpc";

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
});
