import { Document, Schema, models, model } from "mongoose";

export interface IPayroll {
  employee: Schema.Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  allowance: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  generatedAt: Date;
  remarks?: string;
}
export interface IPayrollDoc extends IPayroll, Document {}
const PayrollSchema = new Schema<IPayrollDoc>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowance: {
      type: Number,
      default: 0,
    },
    overtimePay: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: String,
  },
  {
    timestamps: true,
  }
);
PayrollSchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const Payroll = models?.Payroll || model<IPayrollDoc>("Payroll", PayrollSchema);
export default Payroll;
