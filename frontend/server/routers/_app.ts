import { router } from "@/server/trpc";
import { walletRouter } from "./wallet";
import { emailVerificationRouter } from "./email-verification";
import { transactionsRouter } from "./transactions";

export const appRouter = router({
  linkEmail: emailVerificationRouter,
  wallets: walletRouter,
  transactions: transactionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
