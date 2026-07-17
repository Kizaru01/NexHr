import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
export default function StatCard({
  label,
  value,
  icon: Icon,
  dashboardValue,
}: {
  label: string;
  value?: string;
  dashboardValue?: number;
  icon: LucideIcon;
}) {
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
