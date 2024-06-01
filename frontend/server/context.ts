import { getAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Session, getServerSession } from "next-auth";
import { getSession } from "next-auth/react";

export async function createContext(ctx: CreateNextContextOptions) {
  let session: Session | null = null;

  try {
    session = await getServerSession(ctx.req, ctx.res, getAuthOptions(ctx.req));
  } catch {
    session = await getSession(ctx);
  }

  return createContextInner({ session });
}

interface CreateInnerContextOptions extends Partial<CreateNextContextOptions> {
  session: Session | null;
}

export async function createContextInner(opts?: CreateInnerContextOptions) {
  return {
    session: opts?.session,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;
