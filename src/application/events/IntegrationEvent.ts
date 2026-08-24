import type { EventType } from "./EventTypes.js";

export type AggregateType = "user" | "role";

export interface IntegrationEvent<TPayload = unknown> {
  messageId: string;
  eventId: string;

  eventType: EventType;
  eventVersion: number;

  aggregateType: AggregateType;
  aggregateId: string;
  aggregateVersion: number;

  occurredAt: Date;

  payload: TPayload;
}
