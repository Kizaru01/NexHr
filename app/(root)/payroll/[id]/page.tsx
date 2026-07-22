import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  Landmark,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { notFound } from "next/navigation";

import DetailList from "@/components/employee-portal/DetailList";
import PageHeader from "@/components/employee-portal/PageHeader";
import StatCard from "@/components/hr/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { getPayrollDetail } from "@/lib/queries/hr-dashboard.queries";

type PageProps = { params: Promise<{ id: string }> };

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
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
}

export default async function PayrollDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  await requireHrAdminPage();

  const { id } = await params;
  const payroll = await getPayrollDetail(id);
  if (!payroll) notFound();

  const grossPay =
    payroll.basicSalary +
    payroll.allowance +
    payroll.overtimePay +
    payroll.bonus;

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/payroll">
          <ArrowLeft /> Back to payroll
        </Link>
      </Button>
      <PageHeader
        eyebrow="Payroll record"
        title={payrollPeriod(payroll.month, payroll.year)}
        description={`${payroll.employee} · ${payroll.employeeId}`}
        actions={
          payroll.employeeId === "—" ? null : (
            <Button variant="outline" asChild>
              <Link href={`/employees/${payroll.employeeId}`}>
                View employee
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Gross pay"
          value={currency.format(grossPay)}
          icon={BadgeDollarSign}
        />
        <StatCard
          label="Deductions"
          value={currency.format(payroll.deductions)}
          icon={ReceiptText}
        />
        <StatCard
          label="Taxes"
          value={currency.format(payroll.tax)}
          icon={Landmark}
        />
        <StatCard
          label="Net pay"
          value={currency.format(payroll.netSalary)}
          icon={WalletCards}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee details</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              details={[
                { label: "Employee", value: payroll.employee },
                { label: "Employee ID", value: payroll.employeeId },
                { label: "Email", value: payroll.email ?? "Not provided" },
                { label: "Department", value: payroll.department },
                { label: "Position", value: payroll.position },
                { label: "Generated", value: formatDate(payroll.generatedAt) },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pay breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              details={[
                {
                  label: "Basic salary",
                  value: currency.format(payroll.basicSalary),
                },
                {
                  label: "Allowance",
                  value: currency.format(payroll.allowance),
                },
                {
                  label: "Overtime pay",
                  value: currency.format(payroll.overtimePay),
                },
                { label: "Bonus", value: currency.format(payroll.bonus) },
                {
                  label: "Deductions",
                  value: currency.format(payroll.deductions),
                },
                { label: "Tax", value: currency.format(payroll.tax) },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {payroll.remarks ?? "No remarks were added to this payroll record."}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
