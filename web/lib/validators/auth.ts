import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.");

const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .max(128, "Password is too long.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(8, "Password must be at least 8 characters."),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name is too long."),
  email: emailSchema,
  password: passwordSchema.min(8, "Password must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
