import fp from "fastify-plugin";
import {
  closeMongo,
  connectMongo,
} from "../../../../src/infrastructure/database/mongodb/MongoConnection.js";

export default fp(async (fastify) => {
  const database = await connectMongo();

  fastify.decorate("mongo", database);

  fastify.addHook("onClose", async () => {
    await closeMongo();
  });
});
