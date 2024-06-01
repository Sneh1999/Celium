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
import { useSendUserOp } from "@/hooks/useSendUserOp";
import { ChainData, ChainNames } from "@/lib/chains";
import { TokensByChain } from "@/lib/tokens";
import { trpc } from "@/lib/trpc";
import { getAccountInstance } from "@/lib/userop";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { useWalletClient } from "wagmi";

export default function TransferPage() {
  const { data: session } = useSession();
  const { data: walletClient } = useWalletClient();
  const { handleUserOp } = useSendUserOp();
  const allWallets = trpc.wallets.getWallets.useQuery();

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const supportedTokens = useMemo(() => {
    if (!allWallets.data) return [];
    if (!selectedWalletId) return [];

    const wallet = allWallets.data.find(
      (wallet) => wallet.id === Number(selectedWalletId)
    );

    if (!wallet) return [];

    const tokensOnChain =
      TokensByChain[wallet.chain.toLowerCase() as ChainNames];

    return tokensOnChain;
  }, [selectedWalletId]);

  async function handleTransfer() {
    try {
      if (!allWallets.data) throw new Error("No wallets found");
      if (!walletClient) throw new Error("Wallet client not found");
      if (!session) throw new Error("No session found");

      const wallet = allWallets.data.find(
        (wallet) => wallet.id === Number(selectedWalletId)
      );

      if (!wallet) throw new Error("No wallet selected");

      const accountInstance = await getAccountInstance({
        chainName: wallet.chain.toLowerCase() as ChainNames,
        ownerAddress: session?.user.address as `0x${string}`,
        walletClient,
        salt: BigInt(wallet.salt),
        usePaymaster: false,
      });

      const token = supportedTokens.find(
        (token) => token.symbol === selectedTokenSymbol
      );
      if (!token) throw new Error("No token selected");
      const amountInSmallestUnits = parseUnits(amount, token.decimals);

      let target: `0x${string}` = "0x";
      let value: bigint = BigInt(0);
      let data: `0x${string}` = "0x";

      if (token.isNative) {
        target = recipient as `0x${string}`;
        value = amountInSmallestUnits;
        data = "0x";
      } else {
        const transferCalldata = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient as `0x${string}`, amountInSmallestUnits],
        });

        target = token.address;
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
              <Select name="wallet" onValueChange={setSelectedWalletId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {allWallets.data?.map((wallet) => (
                      <SelectItem
                        key={wallet.id}
                        value={wallet.id.toString()}
                        className="w-full"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              ChainData.find(
                                (cd) =>
                                  cd.chainName === wallet.chain.toLowerCase()
                              )!.imageUrl
                            }
                            alt={`${wallet.chain} logo`}
                            className="h-5 w-5"
                          />
                          <span>{wallet.name}</span>
                          <span>$TODO WALLET BALANCE DEXTOOLS</span>
                        </div>
                      </SelectItem>
                    ))}
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
            <Select name="token" onValueChange={setSelectedTokenSymbol}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {supportedTokens.map((token) => (
                    <SelectItem
                      key={token.symbol}
                      value={token.symbol}
                      className="w-full"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={token.imageUrl}
                          alt={`${token.symbol} logo`}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <span className="text-sm text-muted-foreground">
                Value: $1,412 USD
              </span>
            </div>
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
