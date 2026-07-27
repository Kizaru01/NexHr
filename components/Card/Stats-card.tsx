import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  change: string;
  icon: LucideIcon;
  color: string;
}

const toneStyles: Record<string, { icon: string; change: string }> = {
  information: {
    icon: "bg-information-soft text-information",
    change: "bg-information-soft text-information-foreground",
  },
  success: {
    icon: "bg-success-soft text-success",
    change: "bg-success-soft text-success-foreground",
  },
  warning: {
    icon: "bg-warning-soft text-warning",
    change: "bg-warning-soft text-warning-foreground",
  },
  destructive: {
    icon: "bg-destructive-soft text-destructive",
    change: "bg-destructive-soft text-destructive-foreground",
  },
};

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: StatCardProps): React.JSX.Element {
  const tone = toneStyles[color] ?? toneStyles.information;

  return (
    <Card className="min-h-36 justify-center">
      <CardContent>
        <div className="flex items-start gap-3.5">
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone.icon)}>
            <Icon className="size-[1.125rem]" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-caption font-medium">{title}</p>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <p className="metric-value">{value}</p>
              <span className={cn("status-badge mb-0.5", tone.change)}>
                {change}
              </span>
            </div>
            <p className="mt-2 text-caption">
              {title === "Pending Requests" ? "Awaiting review" : "Updated today"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
