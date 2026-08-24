import { z } from "zod";
import { EVENT_TYPES } from "../EventTypes.js";

const rolePayloadSchema = z.object({
  roleId: z.uuid(),
  name: z.string(),
  description: z.string(),
  version: z.number().int().positive(),
});

export const roleCreatedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.ROLE_CREATED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: rolePayloadSchema,
});

export const roleUpdatedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.ROLE_UPDATED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: rolePayloadSchema,
});

export const roleDeletedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.ROLE_DELETED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: z.object({
    roleId: z.uuid(),
    version: z.number().int().positive(),
  }),
});
