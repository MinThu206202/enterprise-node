import { z } from "zod";
import { EVENT_TYPES } from "../EventTypes.js";

const userPayloadBaseSchema = z.object({
  userId: z.uuid(),
  email: z.string().email(),
  name: z.string(),
  version: z.number().int().positive(),
});

export const userRegisteredEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.USER_REGISTERED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: userPayloadBaseSchema,
});

export const userUpdatedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.USER_UPDATED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: userPayloadBaseSchema,
});

export const userDeletedEventSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.literal(EVENT_TYPES.USER_DELETED),
  eventVersion: z.literal(1),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  payload: z.object({
    userId: z.uuid(),
    version: z.number().int().positive(),
  }),
});

export type UserRegisteredEvent = z.infer<typeof userRegisteredEventSchema>;

export type UserUpdatedEvent = z.infer<typeof userUpdatedEventSchema>;

export type UserDeletedEvent = z.infer<typeof userDeletedEventSchema>;
