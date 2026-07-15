import z from "zod";

const objectId = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, `${label} must be a valid ObjectId.`);

const optionalDescription = z
  .string()
  .trim()
  .max(1_000, "Description cannot exceed 1000 characters.")
  .transform((value) => value || undefined)
  .optional();

export const positionFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Position name is required.")
    .max(100, "Position name cannot exceed 100 characters."),
  department: objectId("Department"),
  description: optionalDescription,
});

export const createPositionSchema = positionFieldsSchema;

export const updatePositionSchema = positionFieldsSchema.extend({
  id: objectId("Position ID"),
});

export const setPositionStatusSchema = z.object({
  id: objectId("Position ID"),
  isActive: z.boolean(),
});

export const deletePositionSchema = z.object({
  id: objectId("Position ID") });

export type CreatePositionInput = z.output<typeof createPositionSchema>;
export type UpdatePositionInput = z.output<typeof updatePositionSchema>;
