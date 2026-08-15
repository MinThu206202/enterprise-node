import { z } from "zod";

export const resendForgotPasswordSchema = z.object({
  verificationId: z.string().uuid(),
});

export type ResendForgotPasswordInput = z.infer<
  typeof resendForgotPasswordSchema
>;
