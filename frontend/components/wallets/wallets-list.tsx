import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { WalletItem } from "./wallet-item";

export function WalletsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Wallets
          <Button variant="secondary">Create New</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-96 overflow-auto hover:overflow-y-scroll">
        <div className="flex flex-col gap-2 divide-y">
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
          <WalletItem />
        </div>
      </CardContent>
    </Card>
  );
}
