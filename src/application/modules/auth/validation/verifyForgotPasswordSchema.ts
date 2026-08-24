import { z } from "zod";

export const verifyForgotPasswordSchema = z.object({
  verificationId: z.string().uuid(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export type VerifyForgotPasswordInput = z.infer<
  typeof verifyForgotPasswordSchema
>;
