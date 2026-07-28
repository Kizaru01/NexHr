import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Active: "bg-success-soft text-success-foreground",
  Present: "bg-success-soft text-success-foreground",
  Approved: "bg-success-soft text-success-foreground",
  Published: "bg-success-soft text-success-foreground",
  Paid: "bg-success-soft text-success-foreground",
  Late: "bg-warning-soft text-warning-foreground",
  Pending: "bg-warning-soft text-warning-foreground",
  "On Leave": "bg-information-soft text-information-foreground",
  Leave: "bg-information-soft text-information-foreground",
  Normal: "bg-information-soft text-information-foreground",
  Absent: "bg-destructive-soft text-destructive-foreground",
  Rejected: "bg-destructive-soft text-destructive-foreground",
  High: "bg-destructive-soft text-destructive-foreground",
  Cancelled: "bg-inactive-soft text-inactive",
  Draft: "bg-inactive-soft text-inactive",
  Archived: "bg-inactive-soft text-inactive",
  Inactive: "bg-inactive-soft text-inactive",
  Low: "bg-inactive-soft text-inactive",
};

export default function StatusBadge({
  status,
}: {
  status: string;
}): React.JSX.Element {
  const statusClassName =
    statusStyles[status] ?? "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "status-badge whitespace-nowrap",
        statusClassName
      )}
    >
      {status}
    </span>
  );
}
