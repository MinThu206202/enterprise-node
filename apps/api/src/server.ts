import { createApp } from "./app.js";

import { env } from "../../../src/infrastructure/config/env.js";

import {
  rabbitMQClient,
  welcomeEmailConsumer,
  outboxWorker,
  emailWorker,
  permissionSynchronizer,
} from "./container.js";

const app = await createApp();

async function bootstrap() {
  try {
    // ---------------------------------------------
    // Synchronize permissions
    // ---------------------------------------------

    await permissionSynchronizer.synchronize();

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
      port: env.PORT,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);

    process.exit(1);
  }
}

void bootstrap();