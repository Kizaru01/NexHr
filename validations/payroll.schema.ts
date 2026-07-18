import z from "zod";

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Employee ID must be a valid ObjectId.");

const amount = (label: string) =>
  z.coerce
    .number(`${label} must be a number.`)
    .finite(`${label} must be a valid amount.`)
    .min(0, `${label} cannot be negative.`);

export const payrollPeriodSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const generatePayrollSchema = payrollPeriodSchema.extend({
  employeeId: objectId,
  overtimePay: amount("Overtime pay").default(0),
  bonus: amount("Bonus").default(0),
  deductions: amount("Deductions").default(0),
  tax: amount("Tax").default(0),
  remarks: z
    .string()
    .trim()
    .max(1_000, "Remarks cannot exceed 1000 characters.")
    .transform((value) => value || undefined)
    .optional(),
});

export type GeneratePayrollInput = z.output<typeof generatePayrollSchema>;
export type GenerateMonthlyPayrollInput = z.output<typeof payrollPeriodSchema>;
