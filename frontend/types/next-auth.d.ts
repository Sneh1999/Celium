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

const address = args[0];
const apiResponse = await Functions.makeHttpRequest({
  url: `https://93d8-2607-fea8-a9a8-a900-d89c-5a8f-dc2a-f17b.ngrok-free.app/api/request-2fa/${address}/`,
});

if (apiResponse.error) {
  throw Error("Request failed");
}
const { data } = apiResponse;
return Functions.encodeString(data.name);
