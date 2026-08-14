import { createApp } from "./app.js";

import {
  rabbitMQClient,
  welcomeEmailConsumer,
  outboxWorker,
  emailWorker,
} from "./container.js";

const app = await createApp();

async function bootstrap() {
  try {
    // ---------------------------------------------
    // Connect RabbitMQ
    // ---------------------------------------------

    await rabbitMQClient.connect();

    // ---------------------------------------------
    // Start RabbitMQ consumer
    // ---------------------------------------------

    await welcomeEmailConsumer.start();


    // ---------------------------------------------
    // Start Outbox worker
    // ---------------------------------------------

    void outboxWorker.start();

    // ---------------------------------------------
    // Start Email worker
    // ---------------------------------------------

    await emailWorker.start();

    // ---------------------------------------------
    // Start HTTP server
    // ---------------------------------------------

    await app.listen({
      port: 3000,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);

    process.exit(1);
  }
}

void bootstrap();
