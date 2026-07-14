import z from "zod";

const objectIdSchema = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .regex(/^[a-f\d]{24}$/i, `${field} must be a valid ObjectId`);

export const CreateEmployeeSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required."),
  firstName: z.string().trim().min(1, "First name is required."),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required."),
  department: objectIdSchema("Department"),
  position: objectIdSchema("Position"),
  hireDate: z.date({
    error: "Hire date is required.",
  }),
  employmentType: z.enum([
    "Regular",
    "Probationary",
    "Contractual",
    "Intern",
    "Part-time",
  ]),
  salary: z.object({
    basic: z.number().positive("Basic salary must be greater than 0."),
    allowance: z.number().min(0, "Allowance cannot be negative.").optional(),
  }),
  manager: objectIdSchema("Manager").optional(),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters.")
    .optional(),
});

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

// ---- Personal information (shared by create + updateEmployeeProfile) ----
export const personalInformationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  birthDate: z.coerce.date().optional(),
  gender: genderEnum,
  avatar: z.string().trim().url("Invalid avatar URL").optional(),
});

// ---- Employment information ----
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

// ---- Full create payload ----
export const createEmployeeSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  ...personalInformationSchema.shape,
  ...employmentInformationSchema.shape,
  address: addressSchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
  salary: salarySchema,
});

// ---- Full update payload (employeeId locates the record) ----
export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
});

// ---- Section-level updates ----
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

// ---- Queries ----
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
