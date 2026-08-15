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

  

  // -------------------------
  // Authentication
  // -------------------------

  get jwtAccessSecret() {
    return env.JWT_ACCESS_SECRET;
  }

  get jwtRefreshSecret() {
    return env.JWT_REFRESH_SECRET;
  }

  get jwtAccessExpiresIn() {
    return env.JWT_ACCESS_EXPIRES_IN;
  }

  get jwtRefreshExpiresIn() {
    return env.JWT_REFRESH_EXPIRES_IN;
  }

  get jwtResetSecret() {
    return env.JWT_RESET_SECRET;
  }

  get jwtResetExpiresIn() {
    return env.JWT_RESET_EXPIRES_IN;
  }

  // -------------------------
  // Environment
  // -------------------------

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
