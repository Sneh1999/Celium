import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { WalletItem } from "./wallet-item";
import { cn } from "@/lib/utils";

export function WalletsList() {
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
        <div className="flex flex-col gap-2 divide-y">
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
        </div>
      </CardContent>
    </Card>
  );
}
