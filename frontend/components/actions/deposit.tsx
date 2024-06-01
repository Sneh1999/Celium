import { getViemChainFromChainName } from "@/lib/chains";
import { trpc } from "@/lib/trpc";
import { AppRouter } from "@/server/routers/_app";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { createPublicClient, http, parseUnits } from "viem";
import { useWalletClient } from "wagmi";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ActionProps } from "./props";

export function DepositAction({ tokenInfo, wallet }: ActionProps) {
  const { data: walletClient } = useWalletClient();
  const trpcUtils = trpc.useUtils();

  const [amount, setAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  const viemChain = getViemChainFromChainName(wallet.chain);

  async function handleDeposit() {
    try {
      setIsDepositing(true);
      if (!walletClient) throw new Error("Wallet client not found");

      const amountInSmallestUnits = parseUnits(amount, tokenInfo.decimals);

      if (tokenInfo.isNative) {
        await walletClient.switchChain({
          id: viemChain.id,
        });
        const txnHash = await walletClient.sendTransaction({
          to: wallet.address as `0x${string}`,
          value: amountInSmallestUnits,
        });

        toast.success("Transaction broadcasted", {
          description:
            "Your transaction has been broadcasted and will be processed shortly by the network.",
        });

        const publicClient = createPublicClient({
          chain: viemChain,
          transport: http(),
        });

        await publicClient.waitForTransactionReceipt({ hash: txnHash });

        toast.success("Deposit successful", {
          description: "Your transaction has been confirmed on the network.",
        });

        await trpcUtils.wallets.getWalletByAddress.refetch();
      }
    } catch (e) {
      if (e instanceof Error) {
        return toast.error("Failed to deposit", {
          description: e.message,
        });
      }

      console.error(e);
      toast.error("Something went wrong", {
        description: "Unexpected error. Please try again later.",
      });
    } finally {
      setIsDepositing(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Deposit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
          <DialogDescription>
            Deposit {tokenInfo.symbol} to your wallet!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="secondary"
            isLoading={isDepositing}
            onClick={handleDeposit}
          >
            Deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
