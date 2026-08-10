import { createApp } from "./app.js";
import { config } from "./container.js";

const app = createApp();

const start = async (): Promise<void> => {
  try {
    await app.listen({
      port: config.port,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
