import "server-only";

import { Types } from "mongoose";

import connectToDatabase from "@/database/mongodb";
import Employee from "@/models/employee.model";
import Payroll from "@/models/payroll.model";
import {
  DEFAULT_PAGE_SIZE,
  findFilteredEmployeeIds,
  nameOf,
  payrollSorts,
  safePage,
  serialiseDate,
  type ListFilters,
} from "./hr-dashboard.shared";

function numberFilter(value: string | undefined, minimum: number, maximum: number) {
  const number = Number(value);

  return Number.isInteger(number) && number >= minimum && number <= maximum
    ? number
    : undefined;
}

async function buildPayrollQuery(filters: ListFilters) {
  const query: Record<string, unknown> = {};
  const employeeIds = await findFilteredEmployeeIds(filters);
  const month = numberFilter(filters.month, 1, 12);
  const year = numberFilter(filters.year, 2000, 9999);

  if (employeeIds) {
    query.employee = { $in: employeeIds };
  }

  if (month) {
    query.month = month;
  }

  if (year) {
    query.year = year;
  }

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

function toPayrollListRecord(record: Awaited<ReturnType<typeof Payroll.find>>[number]) {
  const employee = record.employee as unknown as {
    employeeId?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    department?: { name?: string };
    position?: { name?: string };
  } | null;

  return {
    id: record._id.toString(),
    employee: employee?.firstName && employee?.lastName
      ? nameOf({
          firstName: employee.firstName,
          middleName: employee.middleName,
          lastName: employee.lastName,
        })
      : "Deleted employee",
    employeeId: employee?.employeeId ?? "—",
    department: employee?.department?.name ?? "Unassigned",
    position: employee?.position?.name ?? "Unassigned",
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

export async function getPayrollGenerationEmployees() {
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

export async function getPayrollDetail(payrollId: string) {
  if (!Types.ObjectId.isValid(payrollId)) {
    return null;
  }

  await connectToDatabase();

  const payroll = await Payroll.findById(payrollId)
    .populate({
      path: "employee",
      select: "employeeId firstName middleName lastName email department position",
      populate: [
        { path: "department", select: "name" },
        { path: "position", select: "name" },
      ],
    })
    .lean();

  if (!payroll) {
    return null;
  }

  const employee = payroll.employee as unknown as {
    employeeId?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    department?: { name?: string };
    position?: { name?: string };
  } | null;

  return {
    id: payroll._id.toString(),
    employee: employee?.firstName && employee?.lastName
      ? nameOf({
          firstName: employee.firstName,
          middleName: employee.middleName,
          lastName: employee.lastName,
        })
      : "Deleted employee",
    employeeId: employee?.employeeId ?? "—",
    email: employee?.email ?? null,
    department: employee?.department?.name ?? "Unassigned",
    position: employee?.position?.name ?? "Unassigned",
    month: payroll.month,
    year: payroll.year,
    basicSalary: payroll.basicSalary,
    allowance: payroll.allowance,
    overtimePay: payroll.overtimePay,
    bonus: payroll.bonus,
    deductions: payroll.deductions,
    tax: payroll.tax,
    netSalary: payroll.netSalary,
    generatedAt: serialiseDate(payroll.generatedAt),
    remarks: payroll.remarks ?? null,
  };
}

export async function getPayrollDashboard(filters: ListFilters) {
  await connectToDatabase();

  const page = safePage(filters.page);
  const query = await buildPayrollQuery(filters);

  const sort = payrollSorts[filters.sort ?? ""] ?? payrollSorts["generated-desc"];
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

export async function getPayrollExport(filters: ListFilters) {
  await connectToDatabase();

  const query = await buildPayrollQuery(filters);
  const sort = payrollSorts[filters.sort ?? ""] ?? payrollSorts["generated-desc"];
  const records = await Payroll.find(query)
    .populate(payrollEmployeePopulation)
    .sort(sort)
    .lean();

  return records.map(toPayrollListRecord);
}
