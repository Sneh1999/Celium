import { cn, getRelativeTimeString } from "@/lib/utils";
import { ArrowRightLeft, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AppRouter } from "@/server/routers/_app";
import { formatUnits } from "viem";
import { TokensByChain } from "@/lib/tokens";
import { getViemChainFromChainName } from "@/lib/chains";
import { useRouter } from "next/router";

interface TransactionItemProps {
  transaction: NonNullable<
    Awaited<
      ReturnType<AppRouter["transactions"]["getUserTransactions"]>
    >[number]
  >;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const router = useRouter();

  const txnHash = transaction.hash;
  const from = transaction.wallet.address;
  const to = transaction.target;

  const viemChain = getViemChainFromChainName(transaction.wallet.chain);
  const blockExplorerLink = `${viemChain.blockExplorers?.default.url}`;

  const tokenInfo = TokensByChain[transaction.wallet.chain].find(
    (tokenInfo) => tokenInfo.isNative === true
  );
  const decimals = tokenInfo?.decimals ?? 18;

  const amount = formatUnits(transaction.value, decimals);

  return (
    <div
      className={cn(
        "flex py-4 items-center text-sm justify-between transition-all hover:bg-muted px-2 rounded-md"
      )}
      onClick={() => {
        router.push(`/tx/${transaction.walletId}/${transaction.nonce}`);
      }}
    >
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline">
          <ArrowRightLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-1">
          <Link
            href={`${blockExplorerLink}/tx/${txnHash}`}
            target="_blank"
            className="text-blue-400"
            onClick={(e) => e.stopPropagation()}
          >
            {txnHash
              ? `${txnHash.substring(0, 6)}...${txnHash.substring(58)}`
              : "-"}
          </Link>
          <span>{getRelativeTimeString(transaction.createdAt)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span>From: </span>
          <Link
            href={`${blockExplorerLink}/address/${from}`}
            target="_blank"
            className="text-blue-400"
          >
            {from.substring(0, 6)}...{from.substring(38)}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <span>To: </span>
          <Link
            href={`${blockExplorerLink}/address/${to}`}
            target="_blank"
            className="text-blue-400"
          >
            {to.substring(0, 6)}...{to.substring(38)}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span>Amount: </span>
          <span>
            {amount} {tokenInfo?.symbol}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>Status: </span>
          <Badge
            variant={
              transaction.isSuccess
                ? "success"
                : transaction.isPaused
                ? "warning"
                : transaction.isFailed
                ? "error"
                : "info"
            }
          >
            {transaction.isSuccess
              ? "Success"
              : transaction.isPaused
              ? "2FA Required"
              : transaction.isFailed
              ? "Failed"
              : "Cancelled"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <ChevronRightIcon className="h-4 w-4" />
      </div>
    </div>
  );
}
