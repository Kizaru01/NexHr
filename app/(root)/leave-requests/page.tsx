import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";

import {
  leaveSortOptions,
  leaveStatusOptions,
  leaveTypeOptions,
} from "@/constants/filter-options";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import Pagination from "@/components/hr/Pagination";
import StatCard from "@/components/hr/StatCard";
import StatusBadge from "@/components/hr/StatusBadge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { normaliseSearchParams } from "@/lib/search-params";
import {
  getEmployeeFilters,
  getLeaveDashboard,
} from "@/queries/hr-dashboard.queries";
import type { FilterControl, PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default async function LeaveRequestsPage({ searchParams }: PageProps) {
  await requireHrAdminPage();

  const filters = normaliseSearchParams(await searchParams);
  const [{ records, stats, page, totalPages, total }, options] = await Promise.all([
    getLeaveDashboard(filters),
    getEmployeeFilters(),
  ]);
  const filterControls: readonly FilterControl[] = [
    {
      type: "search",
      key: "search",
      placeholder: "Search employee",
      ariaLabel: "Search leave requests by employee",
      className: "md:w-80",
    },
    {
      type: "select",
      key: "department",
      label: "Department",
      emptyLabel: "All departments",
      options: options.departments,
    },
    {
      type: "select",
      key: "type",
      label: "Leave type",
      emptyLabel: "All leave types",
      options: leaveTypeOptions,
    },
    {
      type: "select",
      key: "status",
      label: "Leave status",
      emptyLabel: "All statuses",
      options: leaveStatusOptions,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Time away</p>
        <h1 className="text-3xl font-bold tracking-tight">Leave requests</h1>
        <p className="mt-1 text-muted-foreground">
          Track leave approvals and employee availability.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending" value={stats.pending} icon={CalendarClock} />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} />
        <StatCard label="Cancelled" value={stats.cancelled} icon={XCircle} />
      </div>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Leave requests</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "request" : "requests"}
          </CardDescription>
          <CardAction>
            <UrlFilterSelect
              field="sort"
              label="Sort leave requests"
              options={leaveSortOptions}
              defaultValue="recently-added"
              className="w-52"
            />
          </CardAction>
        </CardHeader>

        <CardContent className="border-b py-4">
          <FilterToolbar controls={filterControls} />
        </CardContent>

        <div className="overflow-x-auto">
          <table className="w-full min-w-275 text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                {[
                  "Employee",
                  "Department",
                  "Leave type",
                  "Start",
                  "End",
                  "Reason",
                  "Approver",
                  "Status",
                  "Submitted",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold">{record.employee}</td>
                  <td className="px-4 py-3">{record.department}</td>
                  <td className="px-4 py-3">{record.type}</td>
                  <td className="px-4 py-3">{formatDate(record.startDate)}</td>
                  <td className="px-4 py-3">{formatDate(record.endDate)}</td>
                  <td
                    className="max-w-56 truncate px-4 py-3"
                    title={record.reason}
                  >
                    {record.reason}
                  </td>
                  <td className="px-4 py-3">{record.approver}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3">{formatDate(record.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {records.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">
            No leave requests match these filters.
          </p>
        )}

        <Pagination page={page} totalPages={totalPages} parameters={filters} />
      </Card>
    </section>
  );
}
