import type { UseFormReturn } from "react-hook-form";
import type z from "zod";

import type {
  GenerateMonthlyPayrollInput,
  GeneratePayrollInput,
} from "@/validations/payroll.schema";
import {
  generatePayrollSchema,
  payrollPeriodSchema,
} from "@/validations/payroll.schema";

export type PayrollFormValues = z.input<typeof generatePayrollSchema>;
export type MonthlyPayrollFormValues = z.input<typeof payrollPeriodSchema>;

export type PayrollNumberFieldProps = {
  form: UseFormReturn<PayrollFormValues, undefined, GeneratePayrollInput>;
  name:
    | "month"
    | "year"
    | "overtimePay"
    | "bonus"
    | "deductions"
    | "tax";
  label: string;
  min: number;
  max?: number;
  step?: string;
};

export type MonthlyPayrollNumberFieldProps = {
  form: UseFormReturn<
    MonthlyPayrollFormValues,
    undefined,
    GenerateMonthlyPayrollInput
  >;
  name: "month" | "year";
  label: string;
  min: number;
  max: number;
};
