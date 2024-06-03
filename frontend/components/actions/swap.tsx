import { wethABI } from "@/abis/WETH.abi";
import { WalletABI } from "@/abis/Wallet.abi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSendUserOp } from "@/hooks/useSendUserOp";
import { ChainData } from "@/lib/chains";
import { ChainFeatures } from "@/lib/features";
import { trpc } from "@/lib/trpc";
import { getAccountInstance } from "@/lib/userop";
import { Chain } from "@prisma/client";
import { ArrowUpDownIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, encodePacked, parseUnits } from "viem";
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
import { Switch } from "../ui/switch";
import { ActionProps } from "./props";

export function SwapAction({ tokenInfo, wallet }: ActionProps) {
  const { data: session } = useSession();

  const { data: walletClient } = useWalletClient();
  const trpcUtils = trpc.useUtils();
  const { handleUserOp } = useSendUserOp();

  const [amount, setAmount] = useState("");
  const [outputTokenSymbol, setOutputTokenSymbol] = useState("");
  const [destinationChain, setDestinationChain] = useState<Chain>("SEPOLIA");
  const [alsoBridge, setAlsoBridge] = useState(true);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);

  async function handleSwap() {
    try {
      if (!walletClient) throw new Error("Wallet client not found");

      setIsSwapping(true);

      const outputToken = wallet.tokenInfo.find(
        (ti) => ti.symbol === outputTokenSymbol
      )!;
      const destinationChainData = ChainData.find(
        (cd) => cd.chain === destinationChain
      )!;

      const accountInstance = await getAccountInstance({
        wallet,
        ownerAddress: session?.user.address as `0x${string}`,
        walletClient,
        usePaymaster: false,
      });

      const amountInSmallestUnits = parseUnits(amount, tokenInfo.decimals);

      const swapPath = encodePacked(
        ["address", "uint24", "address"],
        [tokenInfo.address, 3000, outputToken.address]
      );

      const swapAndBridgeCalldata = encodeFunctionData({
        abi: WalletABI,
        functionName: "swapAndBridge",
        args: [
          tokenInfo.address,
          amountInSmallestUnits,
          outputToken.address,
          BigInt(0),
          swapPath,
          BigInt(destinationChainData.chainSelector),
        ],
      });

      const target = wallet.address as `0x${string}`;
      const value = BigInt(0);
      const data = swapAndBridgeCalldata;

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
      setIsSwapping(false);
    }
  }

  async function handleWrap() {
    try {
      if (!walletClient) throw new Error("Wallet client not found");

      setIsWrapping(true);

      const accountInstance = await getAccountInstance({
        wallet,
        ownerAddress: session?.user.address as `0x${string}`,
        walletClient,
        usePaymaster: false,
      });

      const amountInSmallestUnits = parseUnits(amount, tokenInfo.decimals);

      const wrapCalldata = encodeFunctionData({
        abi: wethABI,
        functionName: "deposit",
      });

      const target = wallet.tokenInfo.find(
        (ti) => ti.symbol === "WETH"
      )!.address;
      const value = BigInt(amountInSmallestUnits);
      const data = wrapCalldata;

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
      setIsWrapping(false);
    }
  }

  if (tokenInfo.isNative) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="pink" className="flex items-center gap-2">
            Wrap <ArrowUpDownIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wrap</DialogTitle>
            <DialogDescription>
              Wrap {tokenInfo.symbol} so you can swap.
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
              isLoading={isWrapping}
              onClick={handleWrap}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="pink" className="flex items-center gap-2">
          Swap <ArrowUpDownIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap</DialogTitle>
          <DialogDescription>
            Swap {tokenInfo.symbol} to another token (on another chain, if you
            want too)!
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

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="token">Output Token</Label>

            <Select
              name="token"
              value={outputTokenSymbol}
              onValueChange={setOutputTokenSymbol}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {wallet.tokenInfo.map((token) => (
                    <SelectItem
                      key={token.address}
                      value={token.symbol}
                      className="w-full"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={token.imageUrl}
                          alt="Celium"
                          className="h-5 w-5"
                        />
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input type="number" id="amount" name="amount" disabled />
          </div>
        </div>

        <div className="flex items-center justify-between border p-2 rounded-md">
          <div className="flex flex-col gap-2 max-w-sm">
            <span className="font-medium text-sm">Bridge?</span>
            <span className="text-sm text-muted-foreground">
              Do you want to bridge the output tokens to another chain?
            </span>
          </div>
          <Switch checked={alsoBridge} onCheckedChange={setAlsoBridge} />
        </div>

        {alsoBridge && (
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
                  {ChainData.filter(
                    (chain) => ChainFeatures[chain.chain].ccip
                  ).map((chain) => (
                    <SelectItem key={chain.chain} value={chain.chain}>
                      <div className="flex items-center gap-2">
                        <img
                          src={chain.imageUrl}
                          alt={chain.fullName}
                          className="h-5 w-5"
                        />
                        {chain.fullName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="secondary"
            isLoading={isSwapping}
            onClick={handleSwap}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
