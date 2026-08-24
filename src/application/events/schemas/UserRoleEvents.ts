import { z } from "zod";
import { EVENT_TYPES } from "../EventTypes.js";

const userRolePayloadSchema = z.object({
  userId: z.uuid(),
  roleId: z.uuid(),
  roleName: z.string().min(1),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});

export const userRoleAssignedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.USER_ROLE_ASSIGNED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: userRolePayloadSchema,
});

export const userRoleRemovedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.USER_ROLE_REMOVED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: userRolePayloadSchema,
});

export type UserRoleAssignedEvent = z.infer<typeof userRoleAssignedEventSchema>;

export type UserRoleRemovedEvent = z.infer<typeof userRoleRemovedEventSchema>;
