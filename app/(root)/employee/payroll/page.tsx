import {
  BadgeDollarSign,
  Download,
  Landmark,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import EmptyState from "@/components/employee-portal/EmptyState";
import PageHeader from "@/components/employee-portal/PageHeader";
import StatCard from "@/components/hr/StatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getOwnPayroll } from "@/queries/employee-portal.payroll";

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

export default async function EmployeePayrollPage() {
  const employee = await requireEmployeePage();
  const payroll = await getOwnPayroll(employee.employeeDatabaseId);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="My pay"
        title="Payroll"
        description="Review your payroll history and download your available payslips."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current salary"
          value={
            payroll.currentSalary === null
              ? "Not available"
              : currency.format(payroll.currentSalary)
          }
          icon={BadgeDollarSign}
        />
        <StatCard
          label="Latest net pay"
          value={payroll.latest ? currency.format(payroll.latest.netPay) : "—"}
          icon={WalletCards}
        />
        <StatCard
          label="Latest deductions"
          value={
            payroll.latest ? currency.format(payroll.latest.deductions) : "—"
          }
          icon={ReceiptText}
        />
        <StatCard
          label="Latest taxes"
          value={payroll.latest ? currency.format(payroll.latest.taxes) : "—"}
          icon={Landmark}
        />
      </div>
      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Payroll history</CardTitle>
          <CardDescription>
            Only your generated payroll records are available here.
          </CardDescription>
        </CardHeader>
        {payroll.payrolls.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-220 text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  {[
                    "Pay period",
                    "Gross earnings",
                    "Deductions",
                    "Taxes",
                    "Net pay",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading || "download"}
                      className="px-4 py-3 font-medium"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payroll.payrolls.map((record) => {
                  const earnings =
                    record.basicSalary +
                    record.allowance +
                    record.overtimePay +
                    record.bonus;
                  return (
                    <tr key={record.id} className="border-t hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">
                        {payrollPeriod(record.month, record.year)}
                      </td>
                      <td className="px-4 py-3">{currency.format(earnings)}</td>
                      <td className="px-4 py-3">
                        {currency.format(record.deductions)}
                      </td>
                      <td className="px-4 py-3">
                        {currency.format(record.taxes)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {currency.format(record.netPay)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/employee/payroll/${record.id}`} download>
                            <Download /> Payslip
                          </a>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No payroll records yet"
            description="Your generated payslips will appear here when they are available."
          />
        )}
      </Card>
    </section>
  );
}
