import {z} from "zod";

export const verifyEmailSchema = z.object({
    verificationId: z.string().uuid(),
    otp : z 
        .string()
        .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export type VerifyEmailInput= 
    z.infer<typeof verifyEmailSchema>