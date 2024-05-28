import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: Omit<User, "emailVerifiedAt"> & {
      emailVerified: boolean;
    };
  }

  interface User {
    id: number;
    address: string;
    email: string | undefined | null;
    emailVerifiedAt: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: number;
    address: string;
    email: string | undefined | null;
    emailVerified: boolean;
  }
}
