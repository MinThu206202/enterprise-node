import pino from "pino";

import { PinoLogger } from "../../../src/infrastructure/logging/PinoLogger.js";
import { prisma } from "../../../src/infrastructure/database/prisma/PrismaClient.js";
import { PrismaUserRepository } from "../../../src/infrastructure/repositories/PrismaUserRepository.js";
import { PrismaRefreshTokenSessionRepository } from "../../../src/infrastructure/repositories/PrismaRefreshTokenSessionRepository.js";

import { Argon2PasswordHasher } from "../../../src/infrastructure/security/Argon2PasswordHasher.js";
import { RegisterUserUseCase } from "../../../src/application/use-cases/auth/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../src/application/use-cases/auth/LoginUserUseCase.js";

import { ConfigService } from "../../../src/infrastructure/config/ConfigService.js";

import { JwtTokenService } from "../../../src/infrastructure/security/JwtTokenService.js";
import { RefreshTokenUseCase } from "../../../src/application/use-cases/auth/RefreshTokenUseCase.js";


const configService = new ConfigService();
const tokenService = new JwtTokenService(configService);
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
});

const appLogger = new PinoLogger(logger);

const userRepository = new PrismaUserRepository(prisma);

const passwordHasher = new Argon2PasswordHasher();

const refreshTokenSessionRepository = new PrismaRefreshTokenSessionRepository(
  prisma,
);

const refreshTokenUseCase = new RefreshTokenUseCase(
  tokenService,
  refreshTokenSessionRepository,
  logger,
);

const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
  tokenService,
  refreshTokenSessionRepository,
  appLogger,
);

const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  passwordHasher,
  appLogger,
);

export const container = {
  userRepository,

  passwordHasher,

  logger: appLogger,

  configService,
  tokenService,

  loginUserUseCase,
  registerUserUseCase,
  refreshTokenSessionRepository,
  refreshTokenUseCase
};
