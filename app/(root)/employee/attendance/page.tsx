import Link from "next/link";
import { Clock3, Percent, Timer, UserCheck, UserX } from "lucide-react";

import EmployeeAttendanceFilters from "@/components/employee-portal/EmployeeAttendanceFilters";
import EmptyState from "@/components/employee-portal/EmptyState";
import PageHeader from "@/components/employee-portal/PageHeader";
import Pagination from "@/components/hr/Pagination";
import StatCard from "@/components/hr/StatCard";
import StatusBadge from "@/components/hr/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { normaliseSearchParams } from "@/lib/search-params";
import {
  getOwnAttendance,
  getOwnAttendanceSummary,
} from "@/queries/employee-portal.attendance";
import type { PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}
function formatTime(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
}

export default async function EmployeeAttendancePage({
  searchParams,
}: PageProps) {
  const employee = await requireEmployeePage();
  const filters = normaliseSearchParams(await searchParams);
  const [attendance, summary] = await Promise.all([
    getOwnAttendance(employee.employeeDatabaseId, filters),
    getOwnAttendanceSummary(employee.employeeDatabaseId),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="My work hours"
        title="Attendance"
        description="Review your daily time records, work hours, and any exceptions."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Present"
          dashboardValue={summary.present}
          icon={UserCheck}
        />
        <StatCard label="Late" dashboardValue={summary.late} icon={Clock3} />
        <StatCard label="Absent" dashboardValue={summary.absent} icon={UserX} />
        <StatCard
          label="Overtime"
          value={`${summary.overtimeHours}h`}
          icon={Timer}
        />
        <StatCard
          label="Attendance rate"
          value={`${summary.attendanceRate}%`}
          icon={Percent}
        />
      </div>
      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Attendance records</CardTitle>
          <CardDescription>
            {attendance.total} {attendance.total === 1 ? "record" : "records"}{" "}
            in your history
          </CardDescription>
        </CardHeader>
        <CardContent className="border-b py-4">
          <EmployeeAttendanceFilters />
        </CardContent>
        {attendance.records.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-250 text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  {[
                    "Date",
                    "Clock in",
                    "Clock out",
                    "Break",
                    "Working",
                    "Overtime",
                    "Status",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.records.map((record) => (
                  <tr key={record.id} className="border-t hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        className="hover:text-primary hover:underline"
                        href={`/employee/attendance/${record.id}`}
                      >
                        {formatDate(record.date)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatTime(record.checkIn)}</td>
                    <td className="px-4 py-3">{formatTime(record.checkOut)}</td>
                    <td className="px-4 py-3">{record.breakDuration}m</td>
                    <td className="px-4 py-3">{record.workingHours}h</td>
                    <td className="px-4 py-3">{record.overtimeHours}h</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No attendance records found"
            description="Try changing the date range or status filters."
          />
        )}
        <Pagination
          page={attendance.page}
          totalPages={attendance.totalPages}
          parameters={filters}
        />
      </Card>
    </section>
  );
}
