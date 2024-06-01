import { useSendUserOp } from "@/hooks/useSendUserOp";
import { trpc } from "@/lib/trpc";
import { getAccountInstance } from "@/lib/userop";
import { SendHorizonalIcon, SendToBackIcon } from "lucide-react";
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
import { Chain } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChainData } from "@/lib/chains";

export function BridgeAction({ tokenInfo, wallet }: ActionProps) {
  const { data: session } = useSession();

  const { data: walletClient } = useWalletClient();
  const trpcUtils = trpc.useUtils();
  const { handleUserOp } = useSendUserOp();

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [destinationChain, setDestinationChain] = useState<Chain>("SEPOLIA");
  const [isBridging, setIsBridging] = useState(false);

  async function handleBridge() {
    try {
      setIsBridging(true);
    } catch (e) {
      if (e instanceof Error) {
        return toast.error("Failed to bridge", {
          description: e.message,
        });
      }

      console.error(e);
      toast.error("Something went wrong", {
        description: "Unexpected error. Please try again later.",
      });
    } finally {
      setIsBridging(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="blue" className="flex items-center gap-2">
          Bridge <SendToBackIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bridge</DialogTitle>
          <DialogDescription>
            Bridge {tokenInfo.symbol} to a wallet on another chain!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="chain">Destination Chain</Label>
          <Select
            name="chain"
            value={destinationChain}
            onValueChange={(v) => setDestinationChain(v as Chain)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ChainData.map((chainData) => (
                  <SelectItem key={chainData.chain} value={chainData.chain}>
                    <div className="flex items-center gap-2">
                      <img
                        src={chainData.imageUrl}
                        alt={chainData.fullName}
                        className="h-5 w-5"
                      />
                      {chainData.fullName}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

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
            isLoading={isBridging}
            onClick={handleBridge}
          >
            Bridge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
