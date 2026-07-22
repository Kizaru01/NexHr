import z from "zod";

export const emailSchema = z
  .email("Invalid email format.")
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(254, "Email is too long."); // RFC standard

export const SignInWithOAuth = z.object({
  provider: z.enum(["google"]),
  providerId: z.string().min(1, "Provider Account is Required"),
  email: emailSchema,
  image: z.string().url("Invalid image URL").optional(),
});
