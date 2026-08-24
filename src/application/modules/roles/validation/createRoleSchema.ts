import z from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(50),

  description: z.string().trim().max(225).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
