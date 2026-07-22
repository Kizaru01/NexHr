import z from "zod";

import { emailSchema } from "./user.schema";

const objectIdSchema = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .regex(/^[a-f\d]{24}$/i, `${field} must be a valid ObjectId`);

export const addressSchema = z.object({
  street: z.string().trim().optional(),
  barangay: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
});

export const emergencyContactSchema = z.object({
  name: z.string().trim().optional(),
  relationship: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export const salarySchema = z.object({
  basic: z.coerce.number().min(0, "Basic salary must be a positive number"),
  allowance: z.coerce.number().min(0).optional(),
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

export const personalInformationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: emailSchema,
  phone: z.string().trim().optional(),
  birthDate: z.coerce.date().optional(),
  gender: genderEnum,
  avatar: z.string().trim().url("Invalid avatar URL").optional(),
});

export const employmentInformationSchema = z.object({
  department: objectIdSchema("Department"),
  position: objectIdSchema("Position"),
  hireDate: z.coerce.date({
    error: "Hire date is required.",
  }),
  employmentType: employmentTypeEnum,
  employmentStatus: employmentStatusEnum.optional(),
  manager: objectIdSchema("Manager").optional(),
  notes: z.string().trim().optional(),
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
