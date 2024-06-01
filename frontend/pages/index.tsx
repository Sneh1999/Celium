import PointsAllTime from "@/components/points/all-time";
import PointsBalance from "@/components/points/balance";
import { AttentionAlert } from "@/components/transactions/attention-alert";
import { TransactionsList } from "@/components/transactions/txns-list";
import { WalletsList } from "@/components/wallets/wallets-list";
import { trpc } from "@/lib/trpc";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const recentTxns = trpc.transactions.getUserTransactions.useQuery();

  return (
    <main className="max-w-7xl mx-auto pt-20 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <WalletsList />
        <TransactionsList
          transactions={recentTxns.data}
          isLoading={recentTxns.isLoading}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <PointsAllTime />
        <PointsBalance />
        <AttentionAlert />
      </div>
    </main>
  );
};

export default Home;
