import { WalletABI } from "@/abis/Wallet.abi";
import { trpc } from "@/lib/trpc";
import { getAccountInstance } from "@/lib/userop";
import { toast } from "sonner";
import { parseEventLogs } from "viem";
import { useState } from "react";
import { SendUserOperationResponse } from "userop/dist/v06/account";

interface BaseHandleUserOpOpts {
  accountInstance: Awaited<ReturnType<typeof getAccountInstance>>;
  walletId: number;
}

interface ExecuteHandleUserOpOpts extends BaseHandleUserOpOpts {
  walletFn: "execute";
  target: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}

interface ApproveHandleUserOpOpts extends BaseHandleUserOpOpts {
  walletFn: "approveTransaction";
  pausedNonce: bigint;
  approveSignature: `0x${string}`;
}

export function useSendUserOp() {
  const recordNewTransaction =
    trpc.transactions.recordNewTransaction.useMutation();
  const succeedPausedTransaction =
    trpc.transactions.succeedPausedTransaction.useMutation();

  async function handleUserOp(
    opts: ExecuteHandleUserOpOpts | ApproveHandleUserOpOpts
  ) {
    const walletNonce = await opts.accountInstance.getNonce();

    let userOp: SendUserOperationResponse;
    if (opts.walletFn === "execute") {
      userOp = await opts.accountInstance
        .encodeCallData(opts.walletFn, [opts.target, opts.value, opts.data])
        .sendUserOperation();
    } else {
      userOp = await opts.accountInstance
        .encodeCallData(opts.walletFn, [
          opts.pausedNonce,
          opts.approveSignature,
        ])
        .sendUserOperation();
    }

    toast.success("Transaction broadcasted", {
      description:
        "Your transaction has been broadcasted and will be processed shortly by the network.",
    });

    const receipt = await userOp.wait();
    const txnHash = receipt?.receipt.transactionHash;

    if (!receipt) {
      if (opts.walletFn === "execute") {
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
      } else {
      }

      throw new Error("Transaction failed");
    }

    const logs = parseEventLogs({
      abi: WalletABI,
      logs: receipt.receipt.logs,
      eventName: "TwoFactorAuthRequired",
    });

    const twoFactorRequiredEvent = logs.length > 0 ? logs[0] : undefined;
    const isTxnPaused =
      twoFactorRequiredEvent !== undefined && opts.walletFn === "execute";

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
      if (opts.walletFn === "execute") {
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
      } else {
        await succeedPausedTransaction.mutateAsync({
          walletId: opts.walletId,
          pausedNonce: opts.pausedNonce.toString(),
        });
      }

      toast.success("Transaction confirmed", {
        description: "Your transaction has been confirmed on the network.",
      });
    }
  }

  return {
    handleUserOp,
  };
}
