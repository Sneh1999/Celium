import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { WalletItem } from "./wallet-item";

export function WalletsList() {
  const allWallets = trpc.wallets.getWallets.useQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Wallets
          <Link
            href="/create-wallet"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Create New
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-96 overflow-auto hover:overflow-y-scroll">
        {allWallets.isLoading && <div>Loading...</div>}
        {allWallets.data?.length === 0 && <div>No wallets found</div>}

        <div className="flex flex-col gap-2 divide-y">
          {allWallets.data?.map((wallet) => (
            <WalletItem key={wallet.id} wallet={wallet} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
