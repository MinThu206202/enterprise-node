import { z } from "zod";

export const resendVerificationSchema = z.object({
  verificationId: z.string().uuid(),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
