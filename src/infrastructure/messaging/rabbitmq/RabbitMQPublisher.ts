import type { IMessagePublisher } from "../../../application/services/messaging/IMessagePublisher.js";

import { rabbitmqClient } from "./rabbitmqClient.js";

const EVENTS_EXCHANGE = "enterprise.events";

export class RabbitMQPublisher implements IMessagePublisher {
  constructor(private readonly rabbitMQClient: rabbitmqClient) {}

  async publish(
    messageId: string,
    type: string,
    payload: unknown,
  ): Promise<void> {
    const channel = this.rabbitMQClient.getChannel();

    await channel.assertExchange(EVENTS_EXCHANGE, "topic", {
      durable: true,
    });

    const message = Buffer.from(JSON.stringify(payload));

    const published = channel.publish(EVENTS_EXCHANGE, type, message, {
      persistent: true,
      contentType: "application/json",
      messageId,
      type,
    });

    if (!published) {
      throw new Error(`Failed to publish RabbitMQ message: ${messageId}`);
    }
    // (void type, void payload, void messageId);
    // void this.rabbitMQClient;

    // throw new Error("TEST_RABBITMQ_FAILURE");
  }
}
