import { getViemChainFromChainName } from "@/lib/chains";
import { cn } from "@/lib/utils";
import { AppRouter } from "@/server/routers/_app";
import {
  ArrowDownUpIcon,
  ArrowUpRight,
  SendHorizonalIcon,
  SendToBackIcon,
} from "lucide-react";
import Link from "next/link";
import { formatUnits } from "viem";
import { DepositAction } from "../actions/deposit";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SendAction } from "../actions/send";
import { BridgeAction } from "../actions/bridge";
import { SwapAction } from "../actions/swap";

interface WalletBalancesProps {
  wallet: NonNullable<
    Awaited<ReturnType<AppRouter["wallets"]["getWalletByAddress"]>>
  >;
}

export function WalletBalances({ wallet }: WalletBalancesProps) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4 mb-4 justify-items-between">
          <span className="uppercase text-muted-foreground">ASSET/AMOUNT</span>
          <span className="uppercase text-muted-foreground">PRICE</span>
          <span className="uppercase text-muted-foreground">USD VALUE</span>
          <span className="uppercase text-muted-foreground col-span-2">
            ACTIONS
          </span>
        </div>

        <div className="flex flex-col divide-y">
          {wallet.tokenInfo.map((token) => (
            <BalanceItem key={token.symbol} tokenInfo={token} wallet={wallet} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceItem({
  tokenInfo,
  wallet,
}: {
  tokenInfo: WalletBalancesProps["wallet"]["tokenInfo"][number];
  wallet: WalletBalancesProps["wallet"];
}) {
  const viemChain = getViemChainFromChainName(wallet.chain);
  const blockExplorerLink = `${viemChain.blockExplorers?.default.url}/address/${tokenInfo.address}`;

  return (
    <div className={cn("grid grid-cols-5 gap-4 py-4 justify-items-between")}>
      <div className="flex items-center gap-3">
        <Button size="icon" variant="outline" className="h-12 w-12">
          <img
            src={tokenInfo.imageUrl}
            alt={tokenInfo.symbol}
            className="h-6 w-6"
          />
        </Button>
        <div className="flex flex-col">
          <span className="font-bold text-lg">
            {formatUnits(tokenInfo.balance, tokenInfo.decimals).substring(0, 6)}
          </span>
          <Link
            href={tokenInfo.isNative ? "#" : blockExplorerLink}
            target="_blank"
            className="font-medium text-sm"
          >
            {tokenInfo.symbol}
          </Link>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-lg">$4,301.23</span>

        <span className="font-medium flex items-center gap-1 text-sm text-green-400">
          <span className="text-green-400">3.27%</span>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <span className="text-lg flex items-center">$14,212.34</span>

      <div className="flex items-center gap-2 col-span-2">
        <SendAction tokenInfo={tokenInfo} wallet={wallet} />

        <SwapAction tokenInfo={tokenInfo} wallet={wallet} />

        {/* <BridgeAction tokenInfo={tokenInfo} wallet={wallet} /> */}

        <DepositAction tokenInfo={tokenInfo} wallet={wallet} />
      </div>
    </div>
  );
}
