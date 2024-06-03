import { ChainData } from "@/lib/chains";
import { trpc } from "@/lib/trpc";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import SuperJSON from "superjson";
import { getAuthOptions } from "../api/auth/[...nextauth]";
import { WalletBalances } from "@/components/wallets/balances-list";
import { TransactionsList } from "@/components/transactions/txns-list";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    getAuthOptions(context.req)
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (session && !session.user.emailVerified) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const address = context.query.address as `0x${string}`;
  const trpcHelpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({ session }),
    transformer: SuperJSON,
  });

  const [wallet, txns] = await Promise.all([
    trpcHelpers.wallets.getWalletByAddress.fetch({
      address,
    }),
    trpcHelpers.transactions.getUserTransactionsByWallet.fetch({
      walletAddress: address,
    }),
  ]);

  if (!wallet) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      address: wallet.address,
      trpcState: trpcHelpers.dehydrate(),
    },
  };
};

export default function WalletPage({
  address,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const walletRes = trpc.wallets.getWalletByAddress.useQuery({
    address,
  });
  const txnsRes = trpc.transactions.getUserTransactionsByWallet.useQuery({
    walletAddress: address,
  });
  // TODO: SHOW PREFUND GAS
  if (!address) return null;
  if (!walletRes.data) return null;
  if (!txnsRes.data) return null;

  const wallet = walletRes.data;
  const chainData = ChainData.find((cd) => cd.chain === wallet.chain)!;

  return (
    <main className="max-w-7xl mx-auto pt-20 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={chainData.imageUrl}
            alt={chainData.fullName}
            className="h-8 w-8"
          />
          <h1 className="text-3xl font-bold">{wallet.name}</h1>
          <CopyIcon
            className="h-8 w-8 ml-2 hover:text-muted-foreground"
            onClick={() => {
              window.navigator.clipboard.writeText(wallet.address);
              toast.success("Copied to clipboard");
            }}
          />
        </div>

        <h1 className="text-3xl font-bold text-muted-foreground px-2 py-1 bg-muted rounded-md">
          {chainData.fullName}
        </h1>
      </div>

      <WalletBalances wallet={wallet} />
      <TransactionsList transactions={txnsRes.data} />
    </main>
  );
}
