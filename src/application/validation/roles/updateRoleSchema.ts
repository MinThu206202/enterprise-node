import z from "zod";

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),

  description: z.string().trim().max(255).nullable().optional(),
});

export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>;
