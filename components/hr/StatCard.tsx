import { Card, CardContent } from "@/components/ui/card";
import type { StatCardProps } from "@/types/dashboard";

export default function StatCard({
  label,
  value,
  icon: Icon,
  dashboardValue,
}: StatCardProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {dashboardValue ? (
            <p className="mt-1 text-2xl font-bold">{dashboardValue}</p>
          ) : (
            <p className="mt-1 text-2xl font-bold">{value}</p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
