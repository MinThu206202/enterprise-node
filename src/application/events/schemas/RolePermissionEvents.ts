import { z } from "zod";
import { EVENT_TYPES } from "../EventTypes.js";

const rolePermissionPayloadSchema = z.object({
  roleId: z.uuid(),
  permissionId: z.uuid(),
  permissionCode: z.string(),
});

export const rolePermissionAssignedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.ROLE_PERMISSION_ASSIGNED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: rolePermissionPayloadSchema,
});

export const rolePermissionRemovedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.ROLE_PERMISSION_REMOVED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: rolePermissionPayloadSchema,
});

export type RolePermissionAssignedEvent = z.infer<
  typeof rolePermissionAssignedEventSchema
>;

export type RolePermissionRemovedEvent = z.infer<
  typeof rolePermissionRemovedEventSchema
>;