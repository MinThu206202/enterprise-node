import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  name: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
});

export type CreateUserInput = z.infer<
  typeof createUserSchema
>;