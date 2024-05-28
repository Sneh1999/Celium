import { cn } from "@/lib/utils";
import { ArrowRightLeft, Wallet2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function WalletItem() {
  const walletName = "My Wallet";
  const from = "0x1234567890123456789012345678901234567890";
  const to = "0x1234567890123456789012345678901234567890";
  return (
    <div className={cn("flex py-4 items-center text-sm justify-between")}>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline">
          <Wallet2Icon className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-1">
          <Link href={"#"} target="_blank" className="text-blue-400">
            {walletName}
          </Link>
          <span>$300+ Gas Saved</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span>Total Txns: 41</span>
        <span>Last Txn: 1 hour ago</span>
      </div>

      <div className="flex flex-col gap-1">
        <span>Balance: 1.41 ETH</span>
        <span>
          Deployed: <Badge variant="error">No</Badge>
        </span>
      </div>
    </div>
  );
}
