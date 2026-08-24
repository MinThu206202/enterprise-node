import { z } from "zod";

export const eventEnvelopeSchema = z.object({
  eventId: z.uuid(),
  messageId: z.uuid(),
  eventType: z.string(),
  version: z.number().int().positive(),
  aggregateId: z.uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

export interface IntegrationEvent<TPayload> extends EventEnvelope {
  payload: TPayload;
}
