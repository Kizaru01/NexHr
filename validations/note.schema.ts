import z from "zod";

const employeeProfileNoteIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Note ID must be valid.");

export const noteDurationDaysSchema = z
  .number()
  .int()
  .min(1, "Display time must be at least 1 day.")
  .max(365, "Display time cannot exceed 365 days.");

export const employeeProfileNoteSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required."),
  note: z
    .string()
    .trim()
    .min(2, "Note must contain at least 2 characters.")
    .max(3_000),
  durationDays: noteDurationDaysSchema,
});

export const updateEmployeeProfileNoteSchema = employeeProfileNoteSchema
  .omit({ employeeId: true })
  .extend({ noteId: employeeProfileNoteIdSchema });

export const deleteEmployeeProfileNoteSchema = z.object({
  noteId: employeeProfileNoteIdSchema,
});

export type EmployeeProfileNoteInput = z.infer<
  typeof employeeProfileNoteSchema
>;

export type UpdateEmployeeProfileNoteInput = z.infer<
  typeof updateEmployeeProfileNoteSchema
>;
