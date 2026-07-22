import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-800",
  Present: "bg-emerald-100 text-emerald-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Published: "bg-emerald-100 text-emerald-800",
  Late: "bg-amber-100 text-amber-800",
  Pending: "bg-amber-100 text-amber-800",
  "On Leave": "bg-sky-100 text-sky-800",
  Leave: "bg-sky-100 text-sky-800",
  Absent: "bg-rose-100 text-rose-800",
  Rejected: "bg-rose-100 text-rose-800",
  Cancelled: "bg-slate-100 text-slate-800",
  Draft: "bg-slate-100 text-slate-800",
  Archived: "bg-slate-100 text-slate-800",
  High: "bg-rose-100 text-rose-800",
  Normal: "bg-sky-100 text-sky-800",
  Low: "bg-slate-100 text-slate-800",
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
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        statusClassName
      )}
    >
      {status}
    </span>
  );
}
