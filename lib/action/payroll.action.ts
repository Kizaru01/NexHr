"use server";

import { revalidatePath } from "next/cache";

import Employee from "@/models/employee.model";
import Payroll from "@/models/payroll.model";
import type { ActionResponse, ErrorResponse } from "@/types/global";
import {
  generatePayrollSchema,
  payrollPeriodSchema,
  type GeneratePayrollInput,
  type GenerateMonthlyPayrollInput,
} from "@/validations/payroll.schema";
import action from "../handler/action-helper";
import handleError from "../handler/error";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  isDuplicateKeyError,
} from "../http-errors";

export async function generatePayroll(
  params: GeneratePayrollInput
): Promise<ActionResponse> {
  try {
    const result = await action({
      params,
      schema: generatePayrollSchema,
      roles: ["admin", "hr"],
    });
    const payrollParams = result.params!;
    const {
      bonus,
      deductions,
      employeeId,
      month,
      overtimePay,
      remarks,
      tax,
      year,
    } = payrollParams;
    const employee = await Employee.findOne({
      _id: employeeId,
      employmentStatus: "Active",
    }).select("salary");

    if (!employee) {
      throw new NotFoundError("Active employee");
    }

    const basicSalary = employee.salary.basic;
    const allowance = employee.salary.allowance ?? 0;
    const grossPay =
      basicSalary + allowance + overtimePay + bonus;
    const totalWithholdings = deductions + tax;

    if (totalWithholdings > grossPay) {
      throw new ValidationError({
        deductions: ["Deductions and tax cannot exceed gross pay."],
      });
    }

    await Payroll.create({
      employee: employee._id,
      month,
      year,
      basicSalary,
      allowance,
      overtimePay,
      bonus,
      deductions,
      tax,
      netSalary: grossPay - totalWithholdings,
      remarks,
    });

    revalidatePath("/payroll");
    revalidatePath("/employee/payroll");
    return { success: true };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "Payroll has already been generated for this employee and period."
          )
        : error
    ) as ErrorResponse;
  }
}

export async function generateMonthlyPayroll(
  params: GenerateMonthlyPayrollInput
): Promise<ActionResponse<{ created: number; skipped: number }>> {
  try {
    const result = await action({
      params,
      schema: payrollPeriodSchema,
      roles: ["admin", "hr"],
    });
    const payrollPeriod = result.params!;
    const { month, year } = payrollPeriod;
    const employees = await Employee.find({ employmentStatus: "Active" })
      .select("_id salary")
      .lean();

    if (!employees.length) {
      throw new NotFoundError("Active employees");
    }

    const generatedAt = new Date();
    const bulkResult = await Payroll.bulkWrite(
      employees.map(({ salary: { basic, allowance }, _id }) => {
        const basicSalary = basic;
        const employeeAllowance = allowance ?? 0;

        return {
          updateOne: {
            filter: {
              employee: _id,
              month,
              year,
            },
            update: {
              $setOnInsert: {
                employee: _id,
                month,
                year,
                basicSalary,
                allowance,
                overtimePay: 0,
                bonus: 0,
                deductions: 0,
                tax: 0,
                netSalary: basicSalary + employeeAllowance,
                generatedAt,
              },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false }
    );

    revalidatePath("/payroll");
    revalidatePath("/employee/payroll");

    const created = bulkResult.upsertedCount;
    return {
      success: true,
      data: { created, skipped: employees.length - created },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
