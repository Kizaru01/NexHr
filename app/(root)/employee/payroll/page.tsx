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
import { getOwnPayroll } from "@/lib/queries/employee-portal/employee-portal.payroll";

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

export default async function EmployeePayrollPage(): Promise<
  React.JSX.Element
> {
  const { employeeDatabaseId } = await requireEmployeePage();
  const { currentSalary, latest, payrolls } =
    await getOwnPayroll(employeeDatabaseId);

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
            currentSalary === null
              ? "Not available"
              : currency.format(currentSalary)
          }
          icon={BadgeDollarSign}
        />
        <StatCard
          label="Latest net pay"
          value={latest ? currency.format(latest.netPay) : "—"}
          icon={WalletCards}
        />
        <StatCard
          label="Latest deductions"
          value={
            latest ? currency.format(latest.deductions) : "—"
          }
          icon={ReceiptText}
        />
        <StatCard
          label="Latest taxes"
          value={latest ? currency.format(latest.taxes) : "—"}
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
        {payrolls.length ? (
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
                {payrolls.map((record) => {
                  const {
                    allowance,
                    basicSalary,
                    bonus,
                    deductions,
                    id,
                    month,
                    netPay,
                    overtimePay,
                    taxes,
                    year,
                  } = record;
                  const earnings =
                    basicSalary + allowance + overtimePay + bonus;

                  return (
                    <tr key={id} className="border-t hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">
                        {payrollPeriod(month, year)}
                      </td>
                      <td className="px-4 py-3">{currency.format(earnings)}</td>
                      <td className="px-4 py-3">
                        {currency.format(deductions)}
                      </td>
                      <td className="px-4 py-3">
                        {currency.format(taxes)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {currency.format(netPay)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/employee/payroll/${id}`} download>
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
