import PointsAllTime from "@/components/points/all-time";
import PointsBalance from "@/components/points/balance";
import { AttentionAlert } from "@/components/transactions/attention-alert";
import { RecentTransactions } from "@/components/transactions/recent-txns";
import { WalletsList } from "@/components/wallets/wallets-list";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <main className="max-w-7xl mx-auto pt-20 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <WalletsList />
        <RecentTransactions />
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
