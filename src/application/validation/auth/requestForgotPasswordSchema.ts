import { z } from "zod";

export const requestForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type RequestForgotPasswordInput = z.infer<
  typeof requestForgotPasswordSchema
>;
