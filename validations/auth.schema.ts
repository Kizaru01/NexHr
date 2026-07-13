import z from "zod";
import { emailSchema } from "./user.schema";

export const SignInSchema = z.object({
  name: z.string().min(3, "Name must be at atlest 3 characters"),
  email: emailSchema,
});
export const SignUpSchema = z.object({
  name: z.string().min(3, "Name must be at atlest 3 characters"),
  email: emailSchema,
});
