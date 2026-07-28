import { Card, CardContent } from "@/components/ui/card";
import type { StatCardProps } from "@/types/dashboard";

export default function StatCard({
  label,
  value,
  icon: Icon,
  dashboardValue,
}: StatCardProps): React.JSX.Element {
  return (
    <Card className="min-h-32 justify-center">
      <CardContent className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-caption font-medium">{label}</p>
          {dashboardValue ? (
            <p className="mt-2 metric-value">{dashboardValue}</p>
          ) : (
            <p className="mt-2 metric-value">{value}</p>
          )}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-[1.125rem]" />
        </div>
      </CardContent>
    </Card>
  );
}
