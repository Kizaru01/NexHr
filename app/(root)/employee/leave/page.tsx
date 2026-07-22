import { CalendarClock, CheckCircle2, Umbrella } from "lucide-react";

import EmptyState from "@/components/employee-portal/EmptyState";
import LeaveRequestSheet from "@/components/employee-portal/LeaveRequestSheet";
import LeaveRequestTable from "@/components/employee-portal/LeaveRequestTable";
import PageHeader from "@/components/employee-portal/PageHeader";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import Pagination from "@/components/hr/Pagination";
import StatCard from "@/components/hr/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { normaliseSearchParams } from "@/lib/search-params";
import { getOwnLeaveRequests } from "@/lib/queries/employee-portal/employee-portal.leave";
import type { FilterControl, PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

const controls: readonly FilterControl[] = [
  {
    type: "search",
    key: "search",
    placeholder: "Search request reasons",
    ariaLabel: "Search leave request reasons",
  },
  {
    type: "select",
    key: "type",
    label: "Leave type",
    emptyLabel: "All leave types",
    options: [
      "Annual",
      "Sick",
      "Emergency",
      "Maternity",
      "Paternity",
      "Without Pay",
    ].map((value) => ({ value, label: value })),
  },
  {
    type: "select",
    key: "status",
    label: "Request status",
    emptyLabel: "All statuses",
    options: ["Pending", "Approved", "Rejected", "Cancelled"].map((value) => ({
      value,
      label: value,
    })),
  },
];

export default async function EmployeeLeavePage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const { employeeDatabaseId } = await requireEmployeePage();
  const filters = normaliseSearchParams(await searchParams);
  const {
    balances,
    page,
    records,
    stats,
    total,
    totalPages,
  } = await getOwnLeaveRequests(employeeDatabaseId, filters);
  const annual = balances.find(
    (balance) => balance.leaveType === "Annual"
  );
  const sick = balances.find((balance) => balance.leaveType === "Sick");

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Time away"
        title="Leave requests"
        description="Plan time away, track approvals, and manage pending requests."
        actions={<LeaveRequestSheet balances={balances} />}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Vacation leave"
          value={`${annual?.remaining ?? 0} days`}
          icon={Umbrella}
        />
        <StatCard
          label="Sick leave"
          value={`${sick?.remaining ?? 0} days`}
          icon={CalendarClock}
        />
        <StatCard
          label="Pending requests"
          dashboardValue={stats.pending}
          icon={CalendarClock}
        />
        <StatCard
          label="Approved requests"
          dashboardValue={stats.approved}
          icon={CheckCircle2}
        />
      </div>
      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Leave history</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "request" : "requests"}
          </CardDescription>
        </CardHeader>
        <CardContent className="border-b py-4">
          <FilterToolbar controls={controls} />
        </CardContent>
        {records.length ? (
          <LeaveRequestTable records={records} balances={balances} />
        ) : (
          <EmptyState
            title="No leave requests found"
            description="Submit a new request or change the filters to see your history."
          />
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          parameters={filters}
        />
      </Card>
    </section>
  );
}
