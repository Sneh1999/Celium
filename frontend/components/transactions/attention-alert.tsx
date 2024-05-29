import { trpc } from "@/lib/trpc";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

export function AttentionAlert() {
  const pausedTxns = trpc.transactions.getPausedTransactions.useQuery();

  if (pausedTxns.isLoading) {
    return <div>Loading...</div>;
  }

  if (!pausedTxns.data || pausedTxns.data.length === 0) {
    return (
      <Alert variant="success" className="col-span-2">
        <AlertTitle>All good!</AlertTitle>
        <AlertDescription>
          You have no transactions that need your attention right now.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="warning" className="col-span-2">
      <AlertTitle>Review {pausedTxns.data.length} transactions!</AlertTitle>
      <AlertDescription>
        You have {pausedTxns.data.length} transactions that need your attention
        right now and are paused until you complete two factor authorization on
        them.
      </AlertDescription>
    </Alert>
  );
}
