import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";

import LeaveTypeChart from "@/components/reports/LeaveTypeChart";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import StatCard from "@/components/hr/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLeaveReports } from "@/lib/queries/reports.queries";
import type { FilterOption } from "@/types/filters";

const FIRST_REPORT_YEAR = 2000;

function getYearOptions(): readonly FilterOption[] {
  const currentYear = new Date().getFullYear();

  return Array.from(
    { length: currentYear - FIRST_REPORT_YEAR + 1 },
    (_, index) => {
      const year = currentYear - index;

      return { label: String(year), value: String(year) };
    }
  );
}

type LeaveReportsSectionProps = {
  year?: string;
};

export default async function LeaveReportsSection({
  year,
}: LeaveReportsSectionProps): Promise<React.JSX.Element> {
  const leave = await getLeaveReports(year);
  const yearOptions = getYearOptions();

  return (
    <>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Time away</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Leave reports
          </h2>
          <p className="mt-1 text-muted-foreground">
            Review recorded leave requests from {leave.year} by status and type.
          </p>
        </div>
        <UrlFilterSelect
          field="leaveYear"
          label="Leave report year"
          emptyLabel="Current year"
          options={yearOptions}
          className="sm:w-48"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending"
          value={String(leave.stats.pending)}
          icon={CalendarClock}
        />
        <StatCard
          label="Approved"
          value={String(leave.stats.approved)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Rejected"
          value={String(leave.stats.rejected)}
          icon={XCircle}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Leave requests by type</CardTitle>
            <CardDescription>
              Pending, approved, and rejected requests by leave type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leave.leaveTypes.length ? (
              <LeaveTypeChart data={leave.leaveTypes} />
            ) : (
              <p className="py-20 text-center text-sm text-muted-foreground">
                Leave data will appear as employees submit requests.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Leave type summary</CardTitle>
            <CardDescription>
              Recorded leave requests from {leave.year}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {leave.leaveTypes.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Leave type</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Total
                      </th>
                      <th className="px-5 py-3 text-right font-medium">
                        Approved
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leave.leaveTypes.map((leaveType) => (
                      <tr key={leaveType.name} className="border-t">
                        <td className="px-5 py-3 font-medium">
                          {leaveType.name}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {leaveType.total}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {leaveType.approved}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-6 py-20 text-center text-sm text-muted-foreground">
                No leave data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
