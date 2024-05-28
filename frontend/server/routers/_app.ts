import { z } from "zod";
import { authedUserProcedure, procedure, router } from "@/server/trpc";
import prisma from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { generateRandomDigits } from "@/lib/utils";

export const appRouter = router({
  linkEmailRequest: authedUserProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      // verify if email is valid email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email format.",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email already linked to an account.",
        });
      }

      if (existingUser?.emailVerifiedAt) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email already verified.",
        });
      }

      const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
      const randomToken = generateRandomDigits(6);

      await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          email: email.toLowerCase(),
          emailVerificationToken: {
            create: {
              token: randomToken,
              expires: new Date(Date.now() + EXPIRY_TIME),
            },
          },
        },
      });

      console.log({ randomToken });
    }),

  verifyLinkEmailRequest: authedUserProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;

      const emailVerificationToken =
        await prisma.emailVerificationToken.findUnique({
          where: { user: { id: ctx.session.user.id }, token },
        });

      if (!emailVerificationToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid token.",
        });
      }

      if (emailVerificationToken.expires < new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token expired.",
        });
      }

      await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          emailVerifiedAt: new Date(),
        },
      });
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
