import z from "zod";

const announcementCategories = [
  "Company",
  "People",
  "Policy",
  "Benefits",
  "Events",
] as const;
const announcementPriorities = ["Low", "Normal", "High"] as const;
const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Announcement ID must be a valid ObjectId.");

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(160, "Title cannot exceed 160 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(5_000, "Description cannot exceed 5000 characters."),
  category: z.enum(announcementCategories),
  priority: z.enum(announcementPriorities),
  isPublished: z.boolean(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.extend({
  id: objectId,
});

export const archiveAnnouncementSchema = z.object({ id: objectId });

export const deleteAnnouncementSchema = z.object({ id: objectId });

export type CreateAnnouncementInput = z.output<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.output<typeof updateAnnouncementSchema>;
