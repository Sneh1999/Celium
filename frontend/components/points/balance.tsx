import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PointsBalance() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Points Balance</CardDescription>
        <CardTitle className="text-4xl">1,341,212</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">25+ Token Transfers</div>
        <div className="text-xs text-muted-foreground">10+ Token Swaps</div>
      </CardContent>
    </Card>
  );
}
