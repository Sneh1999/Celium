import { useSendUserOp } from "@/hooks/useSendUserOp";
import { trpc } from "@/lib/trpc";
import { getAccountInstance } from "@/lib/userop";
import { SendHorizonalIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { useWalletClient } from "wagmi";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ActionProps } from "./props";

export function SendAction({ tokenInfo, wallet }: ActionProps) {
  const { data: session } = useSession();

  const { data: walletClient } = useWalletClient();
  const trpcUtils = trpc.useUtils();
  const { handleUserOp } = useSendUserOp();

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    try {
      if (!walletClient) throw new Error("Wallet client not found");

      setIsSending(true);

      const accountInstance = await getAccountInstance({
        wallet,
        ownerAddress: session?.user.address as `0x${string}`,
        walletClient,
        usePaymaster: false,
      });

      const amountInSmallestUnits = parseUnits(amount, tokenInfo.decimals);

      let target: `0x${string}` = "0x";
      let value: bigint = BigInt(0);
      let data: `0x${string}` = "0x";

      if (tokenInfo.isNative) {
        target = recipient as `0x${string}`;
        value = amountInSmallestUnits;
        data = "0x";
      } else {
        const transferCalldata = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient as `0x${string}`, amountInSmallestUnits],
        });

        target = tokenInfo.address;
        value = BigInt(0);
        data = transferCalldata;
      }

      await handleUserOp({
        accountInstance,
        walletFn: "execute",
        walletId: wallet.id,
        target,
        value,
        data,
      });

      await trpcUtils.wallets.getWalletByAddress.refetch();
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        return toast.error("Failed to send", {
          description: e.message,
        });
      }

      toast.error("Something went wrong", {
        description: "Unexpected error. Please try again later.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex items-center gap-2">
          Send <SendHorizonalIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send</DialogTitle>
          <DialogDescription>
            Send {tokenInfo.symbol} to another wallet!
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Input
            type="text"
            id="recipient"
            name="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="secondary"
            isLoading={isSending}
            onClick={handleSend}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
