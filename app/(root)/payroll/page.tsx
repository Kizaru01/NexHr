import { BanknoteArrowDown, Download, ReceiptText, WalletCards } from "lucide-react";
import Link from "next/link";

import {
  payrollMonthOptions,
  payrollSortOptions,
} from "@/constants/filter-options";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import Pagination from "@/components/hr/Pagination";
import StatCard from "@/components/hr/StatCard";
import GenerateMonthlyPayrollSheet from "@/components/payroll/GenerateMonthlyPayrollSheet";
import GeneratePayrollSheet from "@/components/payroll/GeneratePayrollSheet";
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
  getEmployeeFilters,
  getPayrollDashboard,
  getPayrollGenerationEmployees,
} from "@/queries/hr-dashboard.queries";
import type { FilterControl, PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

function payrollPeriod(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatDate(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "—";
}

export default async function PayrollPage({ searchParams }: PageProps) {
  await requireHrAdminPage();
  const filters = normaliseSearchParams(await searchParams);
  const exportParameters = new URLSearchParams(
    Object.entries(filters).filter(
      ([key, value]) => key !== "page" && Boolean(value)
    ) as Array<[string, string]>
  );
  const [{ records, stats, page, totalPages, total }, options, employees] = await Promise.all([
    getPayrollDashboard(filters),
    getEmployeeFilters(),
    getPayrollGenerationEmployees(),
  ]);
  const filterControls: readonly FilterControl[] = [
    {
      type: "search",
      key: "search",
      placeholder: "Search employee name, email, or ID",
      ariaLabel: "Search payroll by employee",
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
      key: "month",
      label: "Pay month",
      emptyLabel: "All months",
      options: payrollMonthOptions,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Compensation</p>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="mt-1 text-muted-foreground">
            Review generated payroll records across your workforce.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GenerateMonthlyPayrollSheet />
          <GeneratePayrollSheet employees={employees} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Generated payrolls" value={String(stats.processed)} icon={ReceiptText} />
        <StatCard label="Total net pay" value={currency.format(stats.totalNetPay)} icon={WalletCards} />
        <StatCard label="Average net pay" value={currency.format(stats.averageNetPay)} icon={BanknoteArrowDown} />
      </div>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Payroll history</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "generated payroll" : "generated payrolls"}
          </CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/payroll/export?${exportParameters.toString()}`}>
                  <Download /> Export CSV
                </a>
              </Button>
              <UrlFilterSelect
                field="sort"
                label="Sort payroll records"
                options={payrollSortOptions}
                defaultValue="generated-desc"
                className="w-56"
              />
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="border-b py-4">
          <FilterToolbar controls={filterControls} />
        </CardContent>

        <div className="overflow-x-auto">
          <table className="w-full min-w-275 text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                {["Employee", "Department", "Position", "Pay period", "Gross pay", "Deductions", "Tax", "Net pay", "Generated", ""].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold">
                    {record.employee}
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{record.employeeId}</span>
                  </td>
                  <td className="px-4 py-3">{record.department}</td>
                  <td className="px-4 py-3">{record.position}</td>
                  <td className="px-4 py-3 font-medium">{payrollPeriod(record.month, record.year)}</td>
                  <td className="px-4 py-3">{currency.format(record.grossPay)}</td>
                  <td className="px-4 py-3">{currency.format(record.deductions)}</td>
                  <td className="px-4 py-3">{currency.format(record.tax)}</td>
                  <td className="px-4 py-3 font-semibold">{currency.format(record.netSalary)}</td>
                  <td className="px-4 py-3">{formatDate(record.generatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/payroll/${record.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {records.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">
            No generated payroll records match these filters.
          </p>
        )}

        <Pagination page={page} totalPages={totalPages} parameters={filters} />
      </Card>
    </section>
  );
}
