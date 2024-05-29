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
import { ChainData, ChainNames } from "@/lib/chains";
import { trpc } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import { getAuthOptions } from "./api/auth/[...nextauth]";

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

  if (session && session.user.emailVerified) {
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
  const [name, setName] = useState("");
  const [maxAmountAllowed, setMaxAmountAllowed] = useState(500);
  const [chain, setChain] = useState<ChainNames>("sepolia");

  const createWallet = trpc.wallets.createNewWallet.useMutation();

  async function handleCreateWallet() {
    try {
      await createWallet.mutateAsync({
        name,
        chainName: chain,
        maxUSDAmountAllowed: maxAmountAllowed,
      });
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

  return (
    <Dialog open={true}>
      <DialogContent hideClose>
        <DialogTitle>Create New Wallet</DialogTitle>
        <DialogDescription>
          Create a new smart account with Celium.
        </DialogDescription>

        <div className="flex flex-col gap-2">
          <Label htmlFor="chain">Chain</Label>
          <Select
            name="chain"
            value={chain}
            onValueChange={(v) => setChain(v as ChainNames)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ChainData.map((chain) => (
                  <SelectItem key={chain.chainName} value={chain.chainName}>
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

        <div className="flex items-center justify-end gap-2">
          <Button onClick={handleCreateWallet} variant="secondary">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
