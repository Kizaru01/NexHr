import {
  BadgeDollarSign,
  Download,
  Landmark,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import PayrollDepartmentChart from "@/components/reports/PayrollDepartmentChart";
import { payrollMonthOptions } from "@/constants/filter-options";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import StatCard from "@/components/hr/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPayrollReports } from "@/lib/queries/reports.queries";

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

type PayrollReportsSectionProps = {
  month?: string;
};

export default async function PayrollReportsSection({
  month,
}: PayrollReportsSectionProps): Promise<React.JSX.Element> {
  const payroll = await getPayrollReports(month);

  return (
    <>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Compensation</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Payroll reports</h2>
          <p className="mt-1 text-muted-foreground">
            Review generated payroll costs for {payroll.period}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/payroll/export?month=${payroll.month}&year=${payroll.year}`}>
              <Download /> Export CSV
            </a>
          </Button>
          <UrlFilterSelect
            field="month"
            label="Payroll report month"
            emptyLabel="Current month"
            options={payrollMonthOptions}
            className="sm:w-48"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Generated payrolls" value={String(payroll.stats.payrolls)} icon={ReceiptText} />
        <StatCard label="Gross pay" value={currency.format(payroll.stats.grossPay)} icon={BadgeDollarSign} />
        <StatCard label="Deductions and tax" value={currency.format(payroll.stats.deductions)} icon={Landmark} />
        <StatCard label="Net payroll cost" value={currency.format(payroll.stats.netPay)} icon={WalletCards} />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Payroll cost by department</CardTitle>
            <CardDescription>
              Compare gross and net payroll costs across departments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payroll.departments.length ? (
              <PayrollDepartmentChart data={payroll.departments} />
            ) : (
              <p className="py-20 text-center text-sm text-muted-foreground">
                Payroll data will appear once a payroll period is generated.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Department payroll summary</CardTitle>
            <CardDescription>Generated payrolls for {payroll.period}.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {payroll.departments.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Department</th>
                      <th className="px-5 py-3 text-right font-medium">Payrolls</th>
                      <th className="px-5 py-3 text-right font-medium">Net cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.departments.map((department) => (
                      <tr key={department.name} className="border-t">
                        <td className="px-5 py-3 font-medium">{department.name}</td>
                        <td className="px-5 py-3 text-right">{department.payrolls}</td>
                        <td className="px-5 py-3 text-right">{currency.format(department.netPay)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-6 py-20 text-center text-sm text-muted-foreground">
                No payroll data available for this month.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
