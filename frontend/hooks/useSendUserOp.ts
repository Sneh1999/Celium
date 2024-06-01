import { WalletABI } from "@/abis/Wallet.abi";
import { trpc } from "@/lib/trpc";
import { getAccountInstance } from "@/lib/userop";
import { toast } from "sonner";
import { parseEventLogs } from "viem";

interface HandleUserOpOpts {
  accountInstance: Awaited<ReturnType<typeof getAccountInstance>>;
  walletFn: "execute" | "approveTransaction";
  walletId: number;
  target: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}

export function useSendUserOp() {
  const recordNewTransaction =
    trpc.transactions.recordNewTransaction.useMutation();

  async function handleUserOp(opts: HandleUserOpOpts) {
    const walletNonce = await opts.accountInstance.getNonce();

    const userOp = await opts.accountInstance
      .encodeCallData(opts.walletFn, [opts.target, opts.value, opts.data])
      .sendUserOperation();

    toast.success("Transaction broadcasted", {
      description:
        "Your transaction has been broadcasted and will be processed shortly by the network.",
    });

    const receipt = await userOp.wait();
    const txnHash = receipt?.receipt.transactionHash;

    if (!receipt) {
      await recordNewTransaction.mutateAsync({
        hash: txnHash,
        target: opts.target,
        value: opts.value,
        data: opts.data,
        nonce: walletNonce,
        pausedNonce: null,
        isPaused: false,
        isSuccess: false,
        isFailed: true,
        walletId: opts.walletId,
      });

      throw new Error("Transaction failed");
    }

    const logs = parseEventLogs({
      abi: WalletABI,
      logs: receipt.logs,
      eventName: "TwoFactorAuthRequired",
    });

    const twoFactorRequiredEvent = logs.length > 0 ? logs[0] : undefined;
    const isTxnPaused = twoFactorRequiredEvent !== undefined;

    if (isTxnPaused) {
      await recordNewTransaction.mutateAsync({
        hash: txnHash,
        target: opts.target,
        value: opts.value,
        data: opts.data,
        nonce: walletNonce,
        pausedNonce: twoFactorRequiredEvent.args.pausedNonce,
        isPaused: true,
        isSuccess: false,
        isFailed: false,
        walletId: opts.walletId,
      });

      toast.warning("Transaction paused", {
        description:
          "Your transaction has been paused for exceeding the allowed USD limit. You will need to approve the transaction again with the guardian.",
      });
    } else {
      await recordNewTransaction.mutateAsync({
        hash: txnHash,
        target: opts.target,
        value: opts.value,
        data: opts.data,
        nonce: walletNonce,
        isPaused: false,
        isSuccess: true,
        isFailed: false,
        walletId: opts.walletId,
      });

      toast.success("Transaction confirmed", {
        description: "Your transaction has been confirmed on the network.",
      });
    }
  }

  return {
    handleUserOp,
  };
}
