import {
  BadgeCheck,
  BriefcaseBusiness,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import AttendanceReportsSection from "@/components/reports/AttendanceReportsSection";
import StatCard from "@/components/hr/StatCard";
import EmployeeDepartmentChart from "@/components/reports/EmployeeDepartmentChart";
import LeaveReportsSection from "@/components/reports/LeaveReportsSection";
import PayrollReportsSection from "@/components/reports/PayrollReportsSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { getEmployeeReports } from "@/lib/queries/reports.queries";
import { normaliseSearchParams } from "@/lib/search-params";
import type { PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

export default async function ReportsPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  await requireHrAdminPage();

  const filters = normaliseSearchParams(await searchParams);
  const { departments, period, stats } = await getEmployeeReports();
  const { active, inactive, newHires, resigned, total } = stats;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">
          Workforce intelligence
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-muted-foreground">
          Review workforce composition and attendance indicators for {period}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total employees" value={total} icon={Users} />
        <StatCard label="Active employees" value={active} icon={BadgeCheck} />
        <StatCard
          label="Inactive employees"
          value={inactive}
          icon={BriefcaseBusiness}
        />
        <StatCard label="New hires" value={newHires} icon={UserPlus} />
        <StatCard
          label="Resigned employees"
          value={resigned}
          icon={UserMinus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Employees by department</CardTitle>
            <CardDescription>
              Compare total and active headcount across departments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departments.length ? (
              <EmployeeDepartmentChart data={departments} />
            ) : (
              <p className="py-20 text-center text-sm text-muted-foreground">
                Department data will appear as employees are added.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Department summary</CardTitle>
            <CardDescription>Current workforce allocation.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {departments.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Department</th>
                      <th className="px-5 py-3 text-right font-medium">Total</th>
                      <th className="px-5 py-3 text-right font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(
                      ({ activeEmployees, employees, name }) => (
                        <tr key={name} className="border-t">
                          <td className="px-5 py-3 font-medium">{name}</td>
                          <td className="px-5 py-3 text-right">
                            {employees}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {activeEmployees}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-6 py-20 text-center text-sm text-muted-foreground">
                No department data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <AttendanceReportsSection month={filters.attendanceMonth} />
      <LeaveReportsSection year={filters.leaveYear} />
      <PayrollReportsSection month={filters.month} />
    </section>
  );
}
