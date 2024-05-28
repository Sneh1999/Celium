import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "./context";

const t = initTRPC.context<Context>().create();

const isLoggedInUser = t.middleware(({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please log in to continue.",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const authedUserProcedure = procedure.use(isLoggedInUser);
