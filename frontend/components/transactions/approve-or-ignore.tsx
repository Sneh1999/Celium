import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSendUserOp } from "@/hooks/useSendUserOp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AppRouter } from "@/server/routers/_app";
import { toast } from "sonner";
import { getAccountInstance } from "@/lib/userop";
import { Button } from "../ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { useSession } from "next-auth/react";

interface ApproveOrIgnoreProps {
  transaction: NonNullable<
    Awaited<ReturnType<AppRouter["transactions"]["getUserTransactionByHash"]>>
  >;
}

export function ApproveOrIgnore({ transaction }: ApproveOrIgnoreProps) {
  const { data: session } = useSession();
  const trpcUtils = trpc.useUtils();
  const ignoreTxn = trpc.transactions.ignorePausedTransaction.useMutation();
  const approveTxn = trpc.transactions.approvePausedTransaction.useMutation();
  const { data: walletClient } = useWalletClient();

  const [isApproving, setIsApproving] = useState(false);
  const [isIgnoring, setIsIgnoring] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const { handleUserOp } = useSendUserOp();

  async function handleApprove() {
    try {
      setIsApproving(true);
      if (!walletClient) throw new Error("Wallet client not found");
      const guardianSignature = await approveTxn.mutateAsync({
        hash: transaction.hash!,
        twoFactorCode,
      });

      if (!guardianSignature) {
        throw new Error("Failed to sign message");
      }

      const accountInstance = await getAccountInstance({
        wallet: transaction.wallet,
        ownerAddress: session?.user.address as `0x${string}`,
        walletClient,
        usePaymaster: false,
      });

      await handleUserOp({
        accountInstance,
        walletFn: "approveTransaction",
        walletId: transaction.wallet.id,
        pausedNonce: transaction.pausedNonce!,
        approveSignature: guardianSignature,
      });

      await trpcUtils.transactions.getUserTransactionByHash.refetch();
    } catch (e) {
      console.log(e);
      toast.error("Failed to approve", {
        description: (e as Error).message,
      });
    } finally {
      setIsApproving(false);
    }
  }

  async function handleIgnore() {
    try {
      setIsIgnoring(true);
      await ignoreTxn.mutateAsync({ hash: transaction.hash! });

      toast.success("Transaction ignored", {
        description: "Your transaction has been ignored.",
      });

      await trpcUtils.transactions.getUserTransactionByHash.refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to ignore", {
        description: (e as Error).message,
      });
    } finally {
      setIsIgnoring(false);
    }
  }

  if (!transaction.isPaused) return null;

  return (
    <Card className="w-fit mt-4">
      <CardHeader>
        <CardTitle>Approve or Ignore?</CardTitle>
        <CardDescription>
          This transaction is currently paused for exceeding the allowed USD
          limit. You will need to approve the transaction again with the
          guardian.
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Approve</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Transaction</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="otp">OTP</Label>
              <InputOTP
                maxLength={6}
                size={20}
                id="otp"
                name="otp"
                value={twoFactorCode}
                onChange={setTwoFactorCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleApprove}
                variant="secondary"
                isLoading={isApproving}
              >
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          variant="secondary"
          onClick={handleIgnore}
          isLoading={isIgnoring}
        >
          Ignore
        </Button>
      </CardFooter>
    </Card>
  );
}
