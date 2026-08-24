import { z } from "zod";

export const verifyLoginOtpSchema =
  z.object({
    verificationId: z.string().uuid(),

    otp: z
      .string()
      .regex(
        /^\d{6}$/,
        "Verification code must be 6 digits.",
      ),
  });

export type VerifyLoginOtpInput =
  z.infer<
    typeof verifyLoginOtpSchema
  >;