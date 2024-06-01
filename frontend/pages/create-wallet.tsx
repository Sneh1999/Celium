import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ChainData } from "@/lib/chains";
import { trpc } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import { getAuthOptions } from "./api/auth/[...nextauth]";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useRouter } from "next/router";
import { ChainFeatures } from "@/lib/features";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Chain } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    getAuthOptions(context.req)
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (session && !session.user.emailVerified) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default function CreateWalletPage() {
  const isMounted = useIsMounted();
  const router = useRouter();

  const [name, setName] = useState("");
  const [maxAmountAllowed, setMaxAmountAllowed] = useState(500);
  const [chain, setChain] = useState<Chain>("SEPOLIA");

  const createWallet = trpc.wallets.createNewWallet.useMutation();

  async function handleCreateWallet() {
    try {
      await createWallet.mutateAsync({
        name,
        chainName: chain,
        maxUSDAmountAllowed: maxAmountAllowed,
      });

      toast.success("Wallet created!", {
        description: "Your wallet has been created.",
      });

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (e) {
      if (e instanceof TRPCError) {
        return toast.error(e.code, {
          description: e.message,
        });
      }

      toast.error("Could not create wallet", {
        description: (e as Error).message,
      });
    }
  }

  if (!isMounted) return null;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) router.push("/");
      }}
    >
      <DialogContent>
        <DialogTitle>Create New Wallet</DialogTitle>
        <DialogDescription>
          Create a new smart account with Celium.
        </DialogDescription>

        <div className="flex flex-col gap-2">
          <Label htmlFor="chain">Chain</Label>
          <Select
            name="chain"
            value={chain}
            onValueChange={(v) => setChain(v as Chain)}
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="name"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="maxAmountAllowed">Max Amount Allowed (USD)</Label>
          <Input
            type="number"
            id="maxAmountAllowed"
            name="maxAmountAllowed"
            value={maxAmountAllowed}
            min={1}
            onChange={(e) => setMaxAmountAllowed(parseInt(e.target.value))}
          />
        </div>

        {!ChainFeatures[chain].functions && (
          <Alert variant={"error"}>
            <AlertTitle className="text-lg font-bold">Important</AlertTitle>
            <AlertDescription>
              This network does not supported Chainlink Functions yet. You will
              not receive notifications about transactions that are blocked by
              2FA, but still be able to see them on the Celium platform.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={handleCreateWallet}
            isLoading={createWallet.isPending}
            variant="secondary"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
