import Link from "next/link";

import { ArrowRight, BellRing, MessageSquareWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConcernDashboardAlerts } from "@/types/concerns";

export default function RecentConcernAlerts({
  alerts,
}: {
  alerts: ConcernDashboardAlerts;
}): React.JSX.Element | null {
  if (!alerts.unread) return null;

  return (
    <Card className="border-primary/25 bg-[linear-gradient(135deg,var(--card),var(--primary-soft))]">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <BellRing className="size-5" />
        </div>
        <CardTitle>
          {alerts.unread} new employee {alerts.unread === 1 ? "concern" : "concerns"}
        </CardTitle>
        <CardDescription>
          Review new submissions that are waiting for the HR team.
        </CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link href="/employee-concerns">
              Open queue <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
        {alerts.concerns.map((concern) => (
          <Link
            key={concern.id}
            href={`/employee-concerns/${concern.id}`}
            className="group flex gap-3 rounded-xl border bg-card/85 p-3.5 outline-none transition hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <MessageSquareWarning className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-primary">
                  {concern.caseNumber}
                </span>
              </div>
              <p className="mt-2 truncate text-sm font-semibold group-hover:text-primary">
                {concern.subject}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {concern.employee}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
