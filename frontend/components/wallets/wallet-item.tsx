import { ChainData, getViemChainFromChainName } from "@/lib/chains";
import { cn, getRelativeTimeString } from "@/lib/utils";
import { AppRouter } from "@/server/routers/_app";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useBalance } from "wagmi";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface WalletItemProps {
  wallet: Awaited<ReturnType<AppRouter["wallets"]["getWallets"]>>[number];
}

export function WalletItem({ wallet }: WalletItemProps) {
  const router = useRouter();
  const viemChain = getViemChainFromChainName(wallet.chain);
  const blockExplorerLink = `${viemChain.blockExplorers?.default.url}/address/${wallet.address}`;

  const chainData = ChainData.find((cd) => cd.chain === wallet.chain)!;

  const walletBalance = useBalance({
    address: wallet.address as `0x${string}`,
    chainId: viemChain.id,
  });

  return (
    <div
      className={cn(
        "flex py-4 items-center text-sm justify-between transition-all hover:bg-muted px-2 rounded-md"
      )}
      onClick={(e) => {
        router.push(`/wallet/${wallet.address}`);
      }}
    >
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline">
          <img
            src={chainData.imageUrl}
            alt={chainData.fullName}
            className="h-5 w-5"
          />
        </Button>
        <div className="flex flex-col gap-1">
          <Link
            href={blockExplorerLink}
            target="_blank"
            className="text-blue-400"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {wallet.name}
          </Link>
          <span>$300+ Gas Saved</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span>Total Txns: {wallet._count.transactions}</span>
        <span>
          Last Txn:{" "}
          {wallet.transactions.length > 0
            ? getRelativeTimeString(wallet.transactions[0].createdAt)
            : "-"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span>
          Balance:{" "}
          {walletBalance.data
            ? `${walletBalance.data.formatted} ${walletBalance.data.symbol}`
            : ""}
        </span>
        <span>
          Deployed:{" "}
          <Badge variant={wallet.isDeployed ? "success" : "error"}>
            {wallet.isDeployed ? "Yes" : "No"}
          </Badge>
        </span>
      </div>

      <div className="flex items-center justify-center">
        <ChevronRightIcon className="h-4 w-4" />
      </div>
    </div>
  );
}
