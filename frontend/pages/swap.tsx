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
import { ChainData } from "@/lib/chains";
import { TokensByChain } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function SwapPage() {
  const [alsoBridge, setAlsoBridge] = useState(false);

  async function handleBridge() {}

  return (
    <div className="max-w-xl mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Swap</CardTitle>
          <CardDescription>
            Swap (and bridge) different tokens through Uniswap
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="wallet">Wallet</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="token">Input Token</Label>
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
                          src={TokensByChain["SEPOLIA"][0].imageUrl}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="token">Output Token</Label>
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
                          src={TokensByChain["SEPOLIA"][0].imageUrl}
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
                // value={chain}
                // onValueChange={(v) => setChain(v as ChainNames)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ChainData.map((chain) => (
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
          <Button onClick={handleBridge} variant="secondary">
            Transfer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
