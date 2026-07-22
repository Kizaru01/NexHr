import z from "zod";

import { emailSchema } from "./user.schema";

const objectIdSchema = (field: string) =>
  z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, `${field} must be a valid record identifier.`);

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[-\s()\d]{7,20}$/, "Enter a valid phone number.");

const avatarSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      /^data:image\/(jpeg|png|webp);base64,/i.test(value) ||
      /^https?:\/\//i.test(value),
    "Profile image must be a supported image."
  )
  .max(3_000_000, "Profile image is too large.");

const leaveTypeSchema = z.enum([
  "Annual",
  "Sick",
  "Emergency",
  "Maternity",
  "Paternity",
  "Without Pay",
]);

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(160),
  mimeType: z.enum([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
  size: z.number().int().positive().max(2_000_000),
  data: z
    .string()
    .max(3_000_000)
    .regex(
      /^data:(application\/pdf|image\/(jpeg|png|webp));base64,/i,
      "Attachment contains an unsupported file type."
    ),
});

function validateLeaveDates(
  { startDate, endDate }: { startDate: Date; endDate: Date },
  context: z.RefinementCtx
): void {
    if (endDate < startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before the start date.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      context.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Leave requests cannot start in the past.",
      });
    }
}

const leaveRequestFields = z.object({
  leaveType: leaveTypeSchema,
  startDate: z.date(),
  endDate: z.date(),
  reason: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters of context.")
    .max(1_000),
  attachment: attachmentSchema.optional(),
});

export const leaveRequestSchema = leaveRequestFields.superRefine(validateLeaveDates);

export const leaveRequestFormSchema = z
  .object({
    leaveType: leaveTypeSchema,
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    reason: z
      .string()
      .trim()
      .min(10, "Please provide at least 10 characters of context.")
      .max(1_000),
  })
  .superRefine(({ startDate, endDate }, context) => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before the start date.",
      });
    }
  });

export const updateLeaveRequestSchema = leaveRequestFields
  .extend({ leaveId: objectIdSchema("Leave request") })
  .superRefine(validateLeaveDates);

export const cancelLeaveRequestSchema = z.object({
  leaveId: objectIdSchema("Leave request"),
});

export const markNotificationReadSchema = z.object({
  notificationId: objectIdSchema("Notification"),
});

export const attendanceCorrectionSchema = z.object({
  attendanceId: objectIdSchema("Attendance"),
  reason: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters of context.")
    .max(1_000),
});

export const ownEmployeeProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  middleName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().min(2).max(80),
  email: emailSchema,
  phone: phoneSchema.optional(),
  birthDate: z
    .date()
    .max(new Date(), "Birth date cannot be in the future.")
    .optional(),
  gender: z.enum(["Male", "Female"]).optional(),
  address: z.object({
    street: z.string().trim().max(160).optional(),
    barangay: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    province: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(20).optional(),
  }),
  emergencyContact: z.object({
    name: z.string().trim().min(2).max(120),
    relationship: z.string().trim().min(2).max(80),
    phone: phoneSchema,
  }),
});

export const ownEmployeeProfileFormSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  middleName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().min(2).max(80),
  email: emailSchema,
  phone: z.string().trim().optional(),
  birthDate: z
    .string()
    .optional()
    .refine(
      (value) => !value || new Date(`${value}T00:00:00`) <= new Date(),
      "Birth date cannot be in the future."
    ),
  gender: z.union([z.enum(["Male", "Female"]), z.literal("")]),
  address: z.object({
    street: z.string().trim().max(160).optional(),
    barangay: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    province: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(20).optional(),
  }),
  emergencyContact: z.object({
    name: z.string().trim().min(2).max(120),
    relationship: z.string().trim().min(2).max(80),
    phone: phoneSchema,
  }),
});

export const profileImageSchema = z.object({ avatar: avatarSchema });

export const notificationPreferencesSchema = z.object({
  leave: z.boolean(),
  attendance: z.boolean(),
  announcements: z.boolean(),
  payroll: z.boolean(),
  email: z.boolean(),
});

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>;
export type OwnEmployeeProfileInput = z.infer<typeof ownEmployeeProfileSchema>;
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
