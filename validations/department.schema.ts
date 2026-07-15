import z from "zod";

const optionalText = (maxLength: number, label: string) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} cannot exceed ${maxLength} characters.`)
    .transform((value) => value || undefined)
    .optional();

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Department ID must be a valid ObjectId.");

export const departmentFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Department name is required.")
    .max(100, "Department name cannot exceed 100 characters."),
  code: optionalText(20, "Department code").transform((value) =>
    value?.toUpperCase()
  ),
  description: optionalText(1_000, "Description"),
});

export const createDepartmentSchema = departmentFieldsSchema;

export const updateDepartmentSchema = departmentFieldsSchema.extend({
  id: objectId,
});

export const setDepartmentStatusSchema = z.object({
  id: objectId,
  isActive: z.boolean(),
});

export const deleteDepartmentSchema = z.object({ id: objectId });

export type CreateDepartmentInput = z.output<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.output<typeof updateDepartmentSchema>;
