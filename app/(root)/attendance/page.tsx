import { CalendarDays, Clock3, UserCheck, UserX } from "lucide-react";

import {
  attendanceSortOptions,
  attendanceStatusOptions,
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
  getAttendanceDashboard,
  getEmployeeFilters,
} from "@/queries/hr-dashboard.queries";
import type { FilterControl, PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

function formatTime(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
}

export default async function AttendancePage({ searchParams }: PageProps) {
  await requireHrAdminPage();

  const filters = normaliseSearchParams(await searchParams);
  const [{ records, stats, page, totalPages, total }, options] =
    await Promise.all([getAttendanceDashboard(filters), getEmployeeFilters()]);
  const filterControls: readonly FilterControl[] = [
    {
      type: "search",
      key: "search",
      placeholder: "Search employee",
      ariaLabel: "Search attendance by employee",
      className: "md:w-80",
    },
    {
      type: "date",
      key: "date",
      ariaLabel: "Attendance date",
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
      key: "status",
      label: "Attendance status",
      emptyLabel: "All statuses",
      options: attendanceStatusOptions,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Workforce time</p>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="mt-1 text-muted-foreground">
          Review daily attendance, working hours, and exceptions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Present today"
          dashboardValue={stats.present}
          icon={UserCheck}
        />
        <StatCard
          label="Late employees"
          dashboardValue={stats.late}
          icon={Clock3}
        />
        <StatCard
          label="Absent employees"
          dashboardValue={stats.absent}
          icon={UserX}
        />
        <StatCard
          label="On leave today"
          dashboardValue={stats.leave}
          icon={CalendarDays}
        />
      </div>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Attendance records</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "record" : "records"}
          </CardDescription>
          <CardAction>
            <UrlFilterSelect
              field="sort"
              label="Sort attendance records"
              options={attendanceSortOptions}
              defaultValue="clock-in-desc"
              className="w-52"
            />
          </CardAction>
        </CardHeader>

        <CardContent className="border-b py-4">
          <FilterToolbar controls={filterControls} />
        </CardContent>

        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                {[
                  "Employee",
                  "Department",
                  "Position",
                  "Date",
                  "Clock in",
                  "Clock out",
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
              {records.map((record) => (
                <tr key={record.id} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold">
                    {record.employee}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {record.employeeId}
                    </span>
                  </td>
                  <td className="px-4 py-3">{record.department}</td>
                  <td className="px-4 py-3">{record.position}</td>
                  <td className="px-4 py-3">
                    {record.date
                      ? new Date(record.date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{formatTime(record.checkIn)}</td>
                  <td className="px-4 py-3">{formatTime(record.checkOut)}</td>
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

        {records.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">
            No attendance records match these filters.
          </p>
        )}

        <Pagination page={page} totalPages={totalPages} parameters={filters} />
      </Card>
    </section>
  );
}
