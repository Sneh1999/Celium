import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PointsAllTime() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Points All Time</CardDescription>
        <CardTitle className="text-4xl">2,141,712</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">$300+ Gas Saved</div>
        <div className="text-xs text-muted-foreground">
          27 Free Transactions
        </div>
      </CardContent>
    </Card>
  );
}
