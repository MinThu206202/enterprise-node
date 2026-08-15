import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password must not exceed 128 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
