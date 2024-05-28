import { cn } from "@/lib/utils";
import { ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function TransactionItem() {
  const txnHash = "0x1234567890123456789012345678901234567890";
  const from = "0x1234567890123456789012345678901234567890";
  const to = "0x1234567890123456789012345678901234567890";
  const amount = "0.00 ETH";
  return (
    <div className={cn("flex py-4 items-center text-sm justify-between")}>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline">
          <ArrowRightLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-1">
          <Link href={"#"} target="_blank" className="text-blue-400">
            {txnHash.substring(0, 6)}...{txnHash.substring(38)}
          </Link>
          <span>1 hour ago</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span>From: </span>
          <Link href={"#"} target="_blank" className="text-blue-400">
            {from.substring(0, 6)}...{from.substring(38)}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <span>To: </span>
          <Link href={"#"} target="_blank" className="text-blue-400">
            {to.substring(0, 6)}...{to.substring(38)}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span>Amount: </span>
          <span>{amount}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Status: </span>
          <Badge variant="success">Success</Badge>
        </div>
      </div>
    </div>
  );
}
