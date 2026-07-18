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
import { ConflictError, NotFoundError, ValidationError } from "../http-errors";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

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
    const employee = await Employee.findOne({
      _id: payrollParams.employeeId,
      employmentStatus: "Active",
    }).select("salary");

    if (!employee) {
      throw new NotFoundError("Active employee");
    }

    const basicSalary = employee.salary.basic;
    const allowance = employee.salary.allowance ?? 0;
    const grossPay =
      basicSalary + allowance + payrollParams.overtimePay + payrollParams.bonus;
    const totalWithholdings = payrollParams.deductions + payrollParams.tax;

    if (totalWithholdings > grossPay) {
      throw new ValidationError({
        deductions: ["Deductions and tax cannot exceed gross pay."],
      });
    }

    await Payroll.create({
      employee: employee._id,
      month: payrollParams.month,
      year: payrollParams.year,
      basicSalary,
      allowance,
      overtimePay: payrollParams.overtimePay,
      bonus: payrollParams.bonus,
      deductions: payrollParams.deductions,
      tax: payrollParams.tax,
      netSalary: grossPay - totalWithholdings,
      remarks: payrollParams.remarks,
    });

    revalidatePath("/payroll");
    revalidatePath("/employee/payroll");
    return { success: true };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError("Payroll has already been generated for this employee and period.")
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
    const employees = await Employee.find({ employmentStatus: "Active" })
      .select("_id salary")
      .lean();

    if (!employees.length) {
      throw new NotFoundError("Active employees");
    }

    const generatedAt = new Date();
    const bulkResult = await Payroll.bulkWrite(
      employees.map((employee) => {
        const basicSalary = employee.salary.basic;
        const allowance = employee.salary.allowance ?? 0;

        return {
          updateOne: {
            filter: {
              employee: employee._id,
              month: payrollPeriod.month,
              year: payrollPeriod.year,
            },
            update: {
              $setOnInsert: {
                employee: employee._id,
                month: payrollPeriod.month,
                year: payrollPeriod.year,
                basicSalary,
                allowance,
                overtimePay: 0,
                bonus: 0,
                deductions: 0,
                tax: 0,
                netSalary: basicSalary + allowance,
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
