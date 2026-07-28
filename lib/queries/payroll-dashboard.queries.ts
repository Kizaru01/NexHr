import "server-only";

import connectToDatabase from "@/database/mongodb";
import Employee from "@/models/employee.model";
import Payroll from "@/models/payroll.model";
import type {
  PayrollDashboardResult,
  PayrollGenerationEmployee,
  PayrollListRecord,
} from "@/types/hr-dashboard";
import {
  DEFAULT_PAGE_SIZE,
  findFilteredEmployeeIds,
  nameOf,
  payrollSorts,
  safePage,
  serialiseDate,
  type ListFilters,
} from "./hr-dashboard.shared";

function numberFilter(
  value: string | undefined,
  minimum: number,
  maximum: number
): number | undefined {
  const number = Number(value);

  return Number.isInteger(number) && number >= minimum && number <= maximum
    ? number
    : undefined;
}

async function buildPayrollQuery(
  filters: ListFilters
): Promise<Record<string, unknown>> {
  const { month: monthFilter, year: yearFilter } = filters;
  const query: Record<string, unknown> = {};
  const employeeIds = await findFilteredEmployeeIds(filters);
  const month = numberFilter(monthFilter, 1, 12);
  const year = numberFilter(yearFilter, 2000, 9999);

  if (employeeIds) query.employee = { $in: employeeIds };
  if (month) query.month = month;
  if (year) query.year = year;

  return query;
}

const payrollEmployeePopulation = {
  path: "employee",
  select: "employeeId firstName middleName lastName department position",
  populate: [
    { path: "department", select: "name" },
    { path: "position", select: "name" },
  ],
};

function toPayrollListRecord(
  record: Awaited<ReturnType<typeof Payroll.find>>[number]
): PayrollListRecord {
  const employee = record.employee as unknown as {
    employeeId?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    department?: { name?: string };
    position?: { name?: string };
  } | null;
  const {
    department,
    employeeId,
    firstName,
    lastName,
    middleName,
    position,
  } = employee ?? {};
  const employeeName =
    firstName && lastName
      ? nameOf({ firstName, middleName, lastName })
      : "Deleted employee";

  return {
    id: record._id.toString(),
    employee: employeeName,
    employeeId: employeeId ?? "—",
    department: department?.name ?? "Unassigned",
    position: position?.name ?? "Unassigned",
    month: record.month,
    year: record.year,
    grossPay:
      record.basicSalary +
      record.allowance +
      record.overtimePay +
      record.bonus,
    deductions: record.deductions,
    tax: record.tax,
    netSalary: record.netSalary,
    generatedAt: serialiseDate(record.generatedAt),
  };
}

export async function getPayrollGenerationEmployees(): Promise<
  PayrollGenerationEmployee[]
> {
  await connectToDatabase();

  const employees = await Employee.find({ employmentStatus: "Active" })
    .select("employeeId firstName middleName lastName")
    .sort({ firstName: 1, lastName: 1 })
    .lean();

  return employees.map((employee) => ({
    id: employee._id.toString(),
    label: `${nameOf(employee)} (${employee.employeeId})`,
  }));
}

export async function getPayrollDashboard(
  filters: ListFilters
): Promise<PayrollDashboardResult> {
  const { page: pageFilter, sort: sortFilter } = filters;

  await connectToDatabase();

  const page = safePage(pageFilter);
  const query = await buildPayrollQuery(filters);
  const sort = payrollSorts[sortFilter ?? ""] ?? payrollSorts["generated-desc"];
  const [records, total, totals] = await Promise.all([
    Payroll.find(query)
      .populate(payrollEmployeePopulation)
      .sort(sort)
      .skip((page - 1) * DEFAULT_PAGE_SIZE)
      .limit(DEFAULT_PAGE_SIZE)
      .lean(),
    Payroll.countDocuments(query),
    Payroll.aggregate<{ _id: null; totalNetPay: number; averageNetPay: number }>([
      { $match: query },
      {
        $group: {
          _id: null,
          totalNetPay: { $sum: "$netSalary" },
          averageNetPay: { $avg: "$netSalary" },
        },
      },
    ]),
  ]);
  const summary = totals[0];

  return {
    records: records.map(toPayrollListRecord),
    stats: {
      processed: total,
      totalNetPay: summary?.totalNetPay ?? 0,
      averageNetPay: summary?.averageNetPay ?? 0,
    },
    page,
    totalPages: Math.max(Math.ceil(total / DEFAULT_PAGE_SIZE), 1),
    total,
  };
}

export async function getPayrollExport(
  filters: ListFilters
): Promise<PayrollListRecord[]> {
  const { sort: sortFilter } = filters;

  await connectToDatabase();

  const query = await buildPayrollQuery(filters);
  const sort = payrollSorts[sortFilter ?? ""] ?? payrollSorts["generated-desc"];
  const records = await Payroll.find(query)
    .populate(payrollEmployeePopulation)
    .sort(sort)
    .lean();

  return records.map(toPayrollListRecord);
}
