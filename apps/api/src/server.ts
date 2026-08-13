import "../../../src/shared/time/AppTimeZone.js";

import { createApp } from "./app.js";

const app = createApp();

const start = async (): Promise<void> => {
  try {
    const port = Number(process.env.PORT ?? 3000);

    await app.listen({
      port,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
