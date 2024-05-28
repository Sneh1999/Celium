import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TransactionItem } from "./txn-item";

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="h-96 overflow-y-scroll">
        <div className="flex flex-col gap-2 divide-y">
          <TransactionItem />
          <TransactionItem />
          <TransactionItem />
          <TransactionItem />
          <TransactionItem />
          <TransactionItem />
          <TransactionItem />
          <TransactionItem />
        </div>
      </CardContent>
    </Card>
  );
}
