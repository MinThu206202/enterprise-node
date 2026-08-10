import { env } from "./env.js";

export class ConfigService {
  get nodeEnv() {
    return env.NODE_ENV;
  }

  get port() {
    return env.PORT;
  }

  get databaseUrl() {
    return env.DATABASE_URL;
  }

  get logLevel() {
    return env.LOG_LEVEL;
  }

  get isProduction() {
    return env.NODE_ENV === "production";
  }

  get isDevelopment() {
    return env.NODE_ENV === "development";
  }

  get isTest() {
    return env.NODE_ENV === "test";
  }
}
