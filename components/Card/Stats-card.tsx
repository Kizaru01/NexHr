import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  change: string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between">
        <div className="space-y-1 ">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className={`rounded-lg bg-muted p-3 ${color}`}>
              <Icon className="size-5" />
            </span>

            <p className="text-muted-foreground text-sm">{title}</p>
          </div>
          <div className="ml-2">
            <h2 className="text-2xl sm:text-4xl font-bold">{value}</h2>

            <p className={`text-md sm:text-lg ${color}`}>{change}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
