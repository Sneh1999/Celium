import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChainData, ChainNames } from "@/lib/chains";
import { TokensByChain } from "@/lib/tokens";
import { trpc } from "@/lib/trpc";
import { getAccountInstance } from "@/lib/userop";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { SendUserOperationResponse } from "userop/dist/v06/account";
import { encodeFunctionData, erc20Abi } from "viem";
import { useWalletClient } from "wagmi";

export default function TransferPage() {
  const { data: session } = useSession();
  const { data: walletClient } = useWalletClient();

  const allWallets = trpc.wallets.getWallets.useQuery();

  async function handleTransfer() {
    try {
      if (!allWallets.data) throw new Error("No wallets found");
      if (!walletClient) throw new Error("Wallet client not found");
      if (!session) throw new Error("No session found");

      const wallet = allWallets.data[0]; // TODO: CHANGE

      const accountInstance = await getAccountInstance({
        chainName: wallet.chain.toLowerCase() as ChainNames,
        ownerAddress: session?.user.address as `0x${string}`,
        walletClient,
        salt: BigInt(wallet.salt),
        usePaymaster: false,
      });

      const tokenAddress = "0xf99F35d284675D594Cf0dda5C7B8979Df947e134";
      const toAddress = "0xf99F35d284675D594Cf0dda5C7B8979Df947e134";
      const amount = BigInt(1e18);
      const isNativeToken = true;

      let userOp: SendUserOperationResponse;
      if (isNativeToken) {
        userOp = await accountInstance
          .encodeCallData("execute", [toAddress, amount, "0x"])
          .sendUserOperation();
      } else {
        const transferCalldata = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [toAddress, amount],
        });

        userOp = await accountInstance
          .encodeCallData("execute", [
            tokenAddress,
            BigInt(0),
            transferCalldata,
          ])
          .sendUserOperation();
      }

      toast.success("Transaction broadcaster", {
        description:
          "Your transfer transaction has been broadcasted and will be processed shortly by the network.",
      });

      await userOp.wait();

      toast.success("Transaction confirmed", {
        description:
          "Your transfer transaction has been confirmed on the network.",
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Transfer</CardTitle>
          <CardDescription>
            Transfer your tokens between wallets or to other addresses
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="wallet">Wallet</Label>
            {allWallets.isLoading ? (
              "Loading..."
            ) : (
              <Select name="wallet">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1" className="w-full">
                      <div className="flex items-center gap-2">
                        <img
                          src={ChainData[0].imageUrl}
                          alt="Celium"
                          className="h-5 w-5"
                        />
                        <span>My Wallet #1</span>
                        <span>($13,214,120)</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="token">Token</Label>
              <span className="text-sm text-muted-foreground">
                Balance: 0.41 ETH
              </span>
            </div>
            <Select name="token">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1" className="w-full">
                    <div className="flex items-center gap-2">
                      <img
                        src={TokensByChain["sepolia"][0].imageUrl}
                        alt="Celium"
                        className="h-5 w-5"
                      />
                      <span>ETH</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <span className="text-sm text-muted-foreground">
                Value: $1,412 USD
              </span>
            </div>
            <Input type="number" id="amount" name="amount" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="recipient">Recipient</Label>

            <Input
              type="text"
              id="recipient"
              name="recipient"
              placeholder="0x..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 max-w-sm">
              <span className="font-medium text-sm">Use Points?</span>
              <span className="text-sm text-muted-foreground">
                This transaction will cost roughly $0.24 USD. You can use 2400
                Points to pay for gas.
              </span>
            </div>
            <Switch />
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            Cancel
          </Link>
          <Button onClick={handleTransfer} variant="secondary">
            Transfer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
