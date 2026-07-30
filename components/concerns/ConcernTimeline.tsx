import { Activity, ArrowRight } from "lucide-react";

import { ConcernStatusBadge } from "@/components/concerns/ConcernBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConcernStatusHistoryView } from "@/types/concerns";

function formatDateTime(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ConcernTimeline({
  history,
}: {
  history: ConcernStatusHistoryView[];
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          Status history
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-0">
          {history.map((entry, index) => (
            <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
              {index < history.length - 1 ? (
                <span className="absolute top-6 bottom-0 left-[0.4375rem] w-px bg-border" />
              ) : null}
              <span className="mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-card bg-primary ring-2 ring-primary/20" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.from ? (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {entry.from}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                    </>
                  ) : null}
                  <ConcernStatusBadge status={entry.to} />
                </div>
                {entry.reason ? (
                  <p className="mt-2 text-xs leading-5 text-foreground">
                    {entry.reason}
                  </p>
                ) : null}
                <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                  {entry.changedBy} · {formatDateTime(entry.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
