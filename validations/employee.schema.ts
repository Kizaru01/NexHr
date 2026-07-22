import z from "zod";

import type { EmploymentType, Gender } from "@/types/global";
import { emailSchema } from "./user.schema";

const objectIdPattern = /^[a-f\d]{24}$/i;

const objectIdSchema = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .regex(objectIdPattern, `${field} must be a valid ObjectId`);

const optionalObjectIdSchema = (field: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === "" || objectIdPattern.test(value),
      `${field} must be a valid ObjectId`
    )
    .transform((value) => value || undefined)
    .optional();

const optionalTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();

const optionalUrlSchema = z
  .union([
    z.literal(""),
    z.string().trim().url("Invalid avatar URL"),
  ])
  .transform((value) => value || undefined)
  .optional();

const dateInputSchema = z.union([z.iso.date(), z.date()]);

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
}

const requiredDateSchema = (field: string) =>
  z
    .union([
      z.string().min(1, `${field} is required`).pipe(z.iso.date()),
      z.date(),
    ])
    .transform(toDate);

const optionalDateSchema = z
  .union([z.literal(""), dateInputSchema])
  .transform((value) => (value === "" ? undefined : toDate(value)))
  .optional();

export const addressSchema = z.object({
  street: optionalTrimmedStringSchema,
  barangay: optionalTrimmedStringSchema,
  city: optionalTrimmedStringSchema,
  province: optionalTrimmedStringSchema,
  postalCode: optionalTrimmedStringSchema,
});

export const emergencyContactSchema = z.object({
  name: optionalTrimmedStringSchema,
  relationship: optionalTrimmedStringSchema,
  phone: optionalTrimmedStringSchema,
});

export const salarySchema = z.object({
  basic: z.number().min(0, "Basic salary must be a positive number"),
  allowance: z.number().min(0).optional(),
});

const employmentTypeEnum = z.enum([
  "Regular",
  "Probationary",
  "Contractual",
  "Intern",
  "Part-time",
]);

const employmentStatusEnum = z.enum([
  "Active",
  "Inactive",
  "On Leave",
  "Resigned",
  "Terminated",
  "Suspended",
]);

const genderEnum = z.enum(["Male", "Female"]);

const requiredEmploymentTypeSchema = z
  .union([z.literal(""), employmentTypeEnum])
  .refine(
    (value): value is EmploymentType => value !== "",
    "Employment type is required"
  );

const requiredGenderSchema = z
  .union([z.literal(""), genderEnum])
  .refine((value): value is Gender => value !== "", "Gender is required");

export const personalInformationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: optionalTrimmedStringSchema,
  lastName: z.string().trim().min(1, "Last name is required"),
  email: emailSchema,
  phone: optionalTrimmedStringSchema,
  birthDate: optionalDateSchema,
  gender: requiredGenderSchema,
  avatar: optionalUrlSchema,
});

export const employmentInformationSchema = z.object({
  department: objectIdSchema("Department"),
  position: objectIdSchema("Position"),
  hireDate: requiredDateSchema("Hire date"),
  employmentType: requiredEmploymentTypeSchema,
  employmentStatus: employmentStatusEnum.optional(),
  manager: optionalObjectIdSchema("Manager"),
  notes: optionalTrimmedStringSchema,
});

export const createEmployeeSchema = z.object({
  requestId: z.string().uuid("Invalid employee creation request."),
  ...personalInformationSchema.shape,
  ...employmentInformationSchema.shape,
  address: addressSchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
  salary: salarySchema,
});

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ requestId: true })
  .partial()
  .extend({
    employeeId: z.string().trim().min(1, "Employee ID is required"),
  });

export const updatePersonalInformationSchema = personalInformationSchema.extend(
  {
    employeeId: z.string().trim().min(1, "Employee ID is required"),
  }
);

export const updateEmploymentInformationSchema =
  employmentInformationSchema.extend({
    employeeId: z.string().trim().min(1, "Employee ID is required"),
  });

export const updateEmergencyContactSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  emergencyContact: emergencyContactSchema,
});

export const updateAddressSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  address: addressSchema,
});

export const getEmployeeByIdSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
});

export const deleteEmployeeSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
});

export const getEmployeesSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  department: z.string().optional(),
  employmentStatus: employmentStatusEnum.optional(),
  employmentType: employmentTypeEnum.optional(),
});
