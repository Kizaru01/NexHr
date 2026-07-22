import "server-only";

import { Types } from "mongoose";

import connectToDatabase from "@/database/mongodb";
import { getUserEmail } from "@/lib/handler/user.helper";
import Payroll from "@/models/payroll.model";
import type { PayrollDetailResult } from "@/types/hr-dashboard";
import { nameOf, serialiseDate } from "./hr-dashboard.shared";

export async function getPayrollDetail(
  payrollId: string
): Promise<PayrollDetailResult | null> {
  if (!Types.ObjectId.isValid(payrollId)) return null;

  await connectToDatabase();

  const payroll = await Payroll.findById(payrollId)
    .populate({
      path: "employee",
      select:
        "employeeId firstName middleName lastName userId department position",
      populate: [
        { path: "department", select: "name" },
        { path: "position", select: "name" },
        { path: "userId", select: "email" },
      ],
    })
    .lean();

  if (!payroll) return null;

  const employee = payroll.employee as unknown as {
    employeeId?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    userId?: { _id: Types.ObjectId; email?: string };
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
    userId,
  } = employee ?? {};
  const employeeName =
    firstName && lastName
      ? nameOf({ firstName, middleName, lastName })
      : "Deleted employee";

  return {
    id: payroll._id.toString(),
    employee: employeeName,
    employeeId: employeeId ?? "—",
    email: userId?.email ? getUserEmail(userId) : null,
    department: department?.name ?? "Unassigned",
    position: position?.name ?? "Unassigned",
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
