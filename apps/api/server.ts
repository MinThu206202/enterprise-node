import { createApp } from "./app.js";

import { env } from "../../src/infrastructure/config/env.js";

import {
  rabbitMQClient,
  welcomeEmailConsumer,
  userReadModelConsumer,
  outboxWorker,
  emailWorker,
  permissionSynchronizer,
  readModelSynchronizer,
  mongoClient,
} from "./container.js";

const app = await createApp();

async function bootstrap() {
  try {
    // ---------------------------------------------
    // Synchronize permissions
    // ---------------------------------------------
    await mongoClient.connect();

    await permissionSynchronizer.synchronize();

    // ---------------------------------------------
    // Synchronize Mongo read models
    // ---------------------------------------------

    await readModelSynchronizer.synchronize();

    // ---------------------------------------------
    // Connect RabbitMQ
    // ---------------------------------------------

    await rabbitMQClient.connect();

    // ---------------------------------------------
    // Start RabbitMQ consumer
    // ---------------------------------------------

    await welcomeEmailConsumer.start();

    // ---------------------------------------------
    // Start User read-model consumer
    // ---------------------------------------------

    await userReadModelConsumer.start();

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
