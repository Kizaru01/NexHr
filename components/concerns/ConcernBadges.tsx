import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  New: "bg-information-soft text-information-foreground",
  Viewed: "bg-primary-soft text-primary",
  "In Progress": "bg-primary-soft text-primary",
  Resolved: "bg-success-soft text-success-foreground",
  Closed: "bg-inactive-soft text-inactive",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-inactive-soft text-inactive",
  Medium: "bg-information-soft text-information-foreground",
  High: "bg-warning-soft text-warning-foreground",
  Urgent: "bg-destructive-soft text-destructive-foreground",
};

export function ConcernStatusBadge({
  status,
}: {
  status: string;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        "status-badge whitespace-nowrap",
        statusStyles[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

export function ConcernPriorityBadge({
  priority,
}: {
  priority: string;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        "status-badge whitespace-nowrap",
        priorityStyles[priority] ?? "bg-muted text-muted-foreground"
      )}
    >
      {priority}
    </span>
  );
}
