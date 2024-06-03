import { ApproveOrIgnore } from "@/components/transactions/approve-or-ignore";
import { Badge } from "@/components/ui/badge";
import { ChainData, getViemChainFromChainName } from "@/lib/chains";
import { trpc } from "@/lib/trpc";
import { getAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { CopyIcon, ExternalLinkIcon } from "lucide-react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { toast } from "sonner";
import SuperJSON from "superjson";
import { formatUnits } from "viem";

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

  const walletId = Number(context.query.wallet);
  const nonce = context.query.nonce as string;

  const trpcHelpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({ session }),
    transformer: SuperJSON,
  });

  const transaction =
    await trpcHelpers.transactions.getUserTransactionByWalletAndNonce.fetch({
      walletId,
      nonce,
    });

  if (!transaction) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      walletId,
      nonce,
      trpcState: trpcHelpers.dehydrate(),
    },
  };
};

export default function TxnPage({
  walletId,
  nonce,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const txnRes = trpc.transactions.getUserTransactionByWalletAndNonce.useQuery({
    walletId,
    nonce,
  });

  if (!walletId || !nonce) return null;
  if (!txnRes.data) return null;

  const txn = txnRes.data;
  const chainData = ChainData.find((cd) => cd.chain === txn.wallet.chain)!;
  const viemChain = getViemChainFromChainName(txn.wallet.chain);
  const blockExplorerLink = `${viemChain.blockExplorers?.default.url}`;

  return (
    <main className="max-w-7xl mx-auto pt-20 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={chainData.imageUrl}
            alt={chainData.fullName}
            className="h-8 w-8"
          />
          <h1 className="text-3xl font-bold">{txn.wallet.name}</h1>
          <CopyIcon
            className="h-8 w-8 ml-2 hover:text-muted-foreground"
            onClick={() => {
              window.navigator.clipboard.writeText(txn.wallet.address);
              toast.success("Copied to clipboard");
            }}
          />
        </div>

        <h1 className="text-3xl font-bold text-muted-foreground px-2 py-1 bg-muted rounded-md">
          {chainData.fullName}
        </h1>
      </div>

      <div className="flex flex-col gap-2 p-4 rounded-md border">
        <div className="flex items-center gap-2">
          <span className="font-medium">Hash: </span>
          <span>{txn.hash}</span>
          <Link href={`${blockExplorerLink}/tx/${txn.hash}`} target="_blank">
            <ExternalLinkIcon className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Target: </span>
          <span>{txn.target}</span>
          <Link
            href={`${blockExplorerLink}/address/${txn.target}`}
            target="_blank"
          >
            <ExternalLinkIcon className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Value: </span>
          <span>
            {formatUnits(txn.value, 18)} {chainData.nativeToken}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Data: </span>
          <span>{txn.data}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Status: </span>
          <Badge
            variant={
              txn.isSuccess
                ? "success"
                : txn.isPaused
                ? "warning"
                : txn.isFailed
                ? "error"
                : "info"
            }
          >
            {txn.isSuccess
              ? "Success"
              : txn.isPaused
              ? "2FA Required"
              : txn.isFailed
              ? "Failed"
              : "Cancelled"}
          </Badge>
        </div>

        <ApproveOrIgnore transaction={txn} />
      </div>
    </main>
  );
}
