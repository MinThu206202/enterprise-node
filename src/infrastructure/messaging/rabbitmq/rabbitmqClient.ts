import amqp, { type Channel, type ChannelModel } from "amqplib";

export class rabbitmqClient {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  async connect(): Promise<void> {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL ?? "amqp://localhost:5672",
    );

    this.channel = await this.connection?.createChannel();

    await this.channel.assertExchange("enterprise.events", "topic", {
      durable: true,
    });
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("RabbitMQ is not connected");
    }

    return this.channel;
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();

    this.channel = null;
    this.connection = null;
  }
}
