import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "@learnweb3dao/siwe";
import type { JWT } from "next-auth/jwt";
import type { NextAuthOptions, Session } from "next-auth";
import NextAuth from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";
import { User } from "@prisma/client";
import { IncomingMessage } from "http";
import { NextApiRequestCookies } from "next/dist/server/api-utils";

export const getAuthOptions = (
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  }
) => {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req }),
          });

          if (!result.success) return null;

          const user = await prisma.user.upsert({
            where: { address: siwe.address.toLowerCase() },
            create: {
              address: siwe.address.toLowerCase(),
            },
            update: {},
          });

          return user;
        } catch (e) {
          return null;
        }
      },
    }),
  ];

  const authOptions: NextAuthOptions = {
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async jwt({ token, trigger, user }) {
        if (trigger === "signIn" || trigger === "signUp") {
          token.sub = Number(user.id);
          token.address = user.address.toLowerCase();
          token.email = user.email;
          token.emailVerifiedAt = user.emailVerifiedAt;
        }

        if (trigger === "update") {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
          });

          if (!dbUser) return token;

          token.address = dbUser.address.toLowerCase();
          token.email = dbUser.email;
          token.emailVerifiedAt = dbUser.emailVerifiedAt;
        }

        return token;
      },

      async session({ session, token }: { session: Session; token: JWT }) {
        session.user = {
          id: token.sub,
          address: token.address,
          email: token.email,
          emailVerified: token.emailVerifiedAt !== null,
        };

        return session;
      },
    },
  };

  return authOptions;
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, getAuthOptions(req));
}
