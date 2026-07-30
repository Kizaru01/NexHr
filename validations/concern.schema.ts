import z from "zod";

import {
  CONCERN_CATEGORIES,
  CONCERN_PRIORITIES,
  CONCERN_STATUSES,
} from "@/constants/concerns";

const objectIdSchema = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, `${label} is not a valid record identifier.`);

export const concernAttachmentInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  mimeType: z.enum([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
  ]),
  size: z.number().int().positive().max(2_000_000),
  data: z
    .string()
    .max(3_000_000)
    .regex(
      /^data:(application\/pdf|image\/(jpeg|png|webp)|text\/plain);base64,/i,
      "Attachment contains an unsupported file type."
    ),
});

const attachmentsSchema = z
  .array(concernAttachmentInputSchema)
  .max(3, "You can attach up to 3 files.")
  .default([])
  .refine(
    (attachments) =>
      attachments.reduce((total, attachment) => total + attachment.size, 0) <=
      5_000_000,
    "Combined attachments cannot exceed 5 MB."
  );

export const createConcernSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, "Subject must contain at least 5 characters.")
    .max(140),
  category: z.enum(CONCERN_CATEGORIES),
  message: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters of context.")
    .max(5_000),
  attachments: attachmentsSchema,
});

export const concernStatusUpdateSchema = z.object({
  concernId: objectIdSchema("Concern"),
  status: z.enum(CONCERN_STATUSES),
  reason: z.string().trim().max(500).optional(),
});

export const concernPriorityUpdateSchema = z.object({
  concernId: objectIdSchema("Concern"),
  priority: z.enum(CONCERN_PRIORITIES),
});

export const concernInternalNoteSchema = z.object({
  concernId: objectIdSchema("Concern"),
  note: z
    .string()
    .trim()
    .min(2, "Note must contain at least 2 characters.")
    .max(3_000),
});

export const concernIdSchema = z.object({
  concernId: objectIdSchema("Concern"),
});

export type ConcernAttachmentInput = z.infer<
  typeof concernAttachmentInputSchema
>;
export type CreateConcernInput = z.infer<typeof createConcernSchema>;
export type ConcernStatusUpdateInput = z.infer<
  typeof concernStatusUpdateSchema
>;
export type ConcernPriorityUpdateInput = z.infer<
  typeof concernPriorityUpdateSchema
>;
export type ConcernInternalNoteInput = z.infer<
  typeof concernInternalNoteSchema
>;
