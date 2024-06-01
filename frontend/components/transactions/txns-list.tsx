import { AppRouter } from "@/server/routers/_app";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TransactionItem } from "./txn-item";

interface TransactionsListProps {
  transactions:
    | Awaited<ReturnType<AppRouter["transactions"]["getUserTransactions"]>>
    | undefined;
  isLoading?: boolean;
}

export function TransactionsList({
  transactions,
  isLoading,
}: TransactionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outgoing Transactions</CardTitle>
      </CardHeader>
      <CardContent className="h-96 overflow-y-scroll">
        {isLoading && <div>Loading...</div>}
        {transactions?.length === 0 && <div>No transactions found</div>}
        <div className="flex flex-col gap-2 divide-y">
          {transactions?.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
