import { AppRouter } from "@/server/routers/_app";

type WalletRes = NonNullable<
  Awaited<ReturnType<AppRouter["wallets"]["getWalletByAddress"]>>
>;

export interface ActionProps {
  tokenInfo: WalletRes["tokenInfo"][number];
  wallet: WalletRes;
}
