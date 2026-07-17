import Link from "next/link";
import { Plus } from "lucide-react";

import {
  employeeSortOptions,
  employmentStatusOptions,
} from "@/constants/filter-options";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import Pagination from "@/components/hr/Pagination";
import StatusBadge from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
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
  getEmployeeDirectory,
  getEmployeeFilters,
} from "@/queries/hr-dashboard.queries";
import type { FilterControl, PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

function formatDate(date: string | null): string {
  return date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(date)
      )
    : "—";
}

export default async function EmployeesPage({ searchParams }: PageProps) {
  await requireHrAdminPage();

  const filters = normaliseSearchParams(await searchParams);
  const [{ employees, page, totalPages, total }, options] = await Promise.all([
    getEmployeeDirectory(filters),
    getEmployeeFilters(),
  ]);
  const filterControls: readonly FilterControl[] = [
    {
      type: "search",
      key: "search",
      placeholder: "Search name, email, or ID",
      ariaLabel: "Search employees",
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
      key: "position",
      label: "Position",
      emptyLabel: "All positions",
      options: options.positions,
    },
    {
      type: "select",
      key: "status",
      label: "Employment status",
      emptyLabel: "All statuses",
      options: employmentStatusOptions,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">People directory</p>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="mt-1 text-muted-foreground">
            Manage employee records, employment information, and reporting
            lines.
          </p>
        </div>
        <Button asChild>
          <Link href="/employees/new">
            <Plus /> Add employee
          </Link>
        </Button>
      </div>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Employee directory</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "employee" : "employees"}
          </CardDescription>
          <CardAction>
            <UrlFilterSelect
              field="sort"
              label="Sort employees"
              options={employeeSortOptions}
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
                  "Position",
                  "Status",
                  "Type",
                  "Hire date",
                  "Contact",
                  "Manager",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-t transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/employees/${employee.employeeId}`}
                      className="font-semibold hover:text-primary"
                    >
                      {employee.name}
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        {employee.employeeId}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{employee.department}</td>
                  <td className="px-4 py-3">{employee.position}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={employee.status} />
                  </td>
                  <td className="px-4 py-3">{employee.type}</td>
                  <td className="px-4 py-3">{formatDate(employee.hireDate)}</td>
                  <td className="px-4 py-3">
                    <span>{employee.email}</span>
                    <span className="block text-xs text-muted-foreground">
                      {employee.phone ?? "No phone"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{employee.manager}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/employees/${employee.employeeId}`}>
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">
            No employees match these filters.
          </p>
        )}

        <Pagination page={page} totalPages={totalPages} parameters={filters} />
      </Card>
    </section>
  );
}
