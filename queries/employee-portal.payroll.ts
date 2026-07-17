import "server-only";

import Employee from "@/models/employee.model";
import Payroll from "@/models/payroll.model";
import { serialiseDate } from "./employee-portal.shared";

export async function getOwnPayroll(employeeId: string) {
  const [employee, payrolls] = await Promise.all([
    Employee.findById(employeeId).select("salary").lean(),
    Payroll.find({ employee: employeeId })
      .select("month year basicSalary allowance overtimePay bonus deductions tax netSalary generatedAt")
      .sort({ year: -1, month: -1 })
      .lean(),
  ]);

  const latest = payrolls[0] ?? null;

  return {
    currentSalary: employee?.salary?.basic ?? null,
    latest: latest
      ? {
          netPay: latest.netSalary,
          deductions: latest.deductions,
          taxes: latest.tax,
          period: `${latest.month}/${latest.year}`,
        }
      : null,
    payrolls: payrolls.map((payroll) => ({
      id: payroll._id.toString(),
      month: payroll.month,
      year: payroll.year,
      basicSalary: payroll.basicSalary,
      allowance: payroll.allowance,
      overtimePay: payroll.overtimePay,
      bonus: payroll.bonus,
      deductions: payroll.deductions,
      taxes: payroll.tax,
      netPay: payroll.netSalary,
      generatedAt: serialiseDate(payroll.generatedAt),
    })),
  };
}
