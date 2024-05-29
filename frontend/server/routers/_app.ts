import { router } from "@/server/trpc";
import { walletRouter } from "./wallet";
import { emailVerificationRouter } from "./email-verification";

export const appRouter = router({
  linkEmail: emailVerificationRouter,
  wallets: walletRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
