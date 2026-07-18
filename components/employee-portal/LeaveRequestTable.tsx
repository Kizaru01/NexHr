"use client";

import { Loader2, Paperclip, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import StatusBadge from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { cancelOwnPendingLeaveRequest } from "@/lib/action/employee/employee-leave.action";
import type { LeaveBalance } from "@/queries/employee-portal.shared";

import LeaveRequestSheet, {
  type LeaveRecordForForm,
} from "./LeaveRequestSheet";

export type LeaveRequestRecord = LeaveRecordForForm & {
  status: string;
  submittedAt: string | null;
  approver: string;
  attachmentName?: string;
};

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function LeaveRequestTable({
  records,
  balances,
}: {
  records: readonly LeaveRequestRecord[];
  balances: readonly LeaveBalance[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function cancelRequest(leaveId: string) {
    startTransition(async () => {
      const response = await cancelOwnPendingLeaveRequest({ leaveId });
      if (!response.success) {
        toast.error(
          response.error?.message ?? "Unable to cancel leave request."
        );
        return;
      }

      toast.success("Leave request cancelled.");
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-220 text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            {[
              "Leave type",
              "Start",
              "End",
              "Duration",
              "Status",
              "Submitted",
              "Approver",
              "",
            ].map((heading) => (
              <th key={heading || "actions"} className="px-4 py-3 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const start = record.startDate ? new Date(record.startDate) : null;
            const end = record.endDate ? new Date(record.endDate) : null;
            const duration =
              start && end
                ? Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
                : 0;
            const editable = record.status === "Pending";

            return (
              <tr key={record.id} className="border-t hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">
                  {record.leaveType}
                  {record.attachmentName ? (
                    <span
                      title={record.attachmentName}
                      className="mt-1 flex items-center gap-1 text-xs font-normal text-muted-foreground"
                    >
                      <Paperclip className="size-3" /> Attachment
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{formatDate(record.startDate)}</td>
                <td className="px-4 py-3">{formatDate(record.endDate)}</td>
                <td className="px-4 py-3">
                  {duration} day{duration === 1 ? "" : "s"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-4 py-3">{formatDate(record.submittedAt)}</td>
                <td className="px-4 py-3">{record.approver}</td>
                <td className="px-4 py-3 text-right">
                  {editable ? (
                    <div className="flex justify-end gap-1">
                      <LeaveRequestSheet balances={balances} record={record} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => cancelRequest(record.id)}
                      >
                        {isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <XCircle />
                        )}
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
