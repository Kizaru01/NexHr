import { Document, Schema, model, models } from "mongoose";

import type { Address } from "@/types/global";

export interface IEmployee {
  userId: Schema.Types.ObjectId;
  employeeId: string;
  creationRequestId?: string;

  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  birthDate?: Date;
  gender?: "Male" | "Female";
  avatar?: string;
  address?: Address;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  department: Schema.Types.ObjectId;
  position: Schema.Types.ObjectId;
  hireDate: Date;
  employmentStatus:
    | "Active"
    | "Inactive"
    | "On Leave"
    | "Resigned"
    | "Terminated"
    | "Suspended";
  employmentType:
    | "Regular"
    | "Probationary"
    | "Contractual"
    | "Intern"
    | "Part-time";
  salary: {
    basic: number;
    allowance?: number;
  };
  regularizedAt?: Date;
  terminationDate?: Date;
  manager?: Schema.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmployeeDoc extends IEmployee, Document {}

const EmployeeSchema = new Schema<IEmployeeDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    creationRequestId: {
      type: String,
      unique: true,
      sparse: true,
      immutable: true,
      trim: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: { type: String },
    birthDate: { type: Date },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    avatar: { type: String },
    address: {
      street: String,
      barangay: String,
      city: String,
      province: String,
      postalCode: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    position: {
      type: Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },

    hireDate: {
      type: Date,
      required: true,
    },

    employmentStatus: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "On Leave",
        "Resigned",
        "Terminated",
        "Suspended",
      ],
      default: "Active",
    },
    employmentType: {
      type: String,
      enum: ["Regular", "Probationary", "Contractual", "Intern", "Part-time"],
      default: "Probationary",
    },
    regularizedAt: { type: Date },
    terminationDate: { type: Date },
    salary: {
      basic: {
        type: Number,
        required: true,
        min: 0,
      },
      allowance: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },

    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const Employee =
  models?.Employee || model<IEmployeeDoc>("Employee", EmployeeSchema);

export default Employee;
