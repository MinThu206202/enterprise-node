import pino from "pino";

import { PinoLogger } from "../../../src/infrastructure/logging/PinoLogger.js";
import { prisma } from "../../../src/infrastructure/database/prisma/PrismaClient.js";
import { PrismaUserRepository } from "../../../src/infrastructure/repositories/PrismaUserRepository.js";
import { PrismaRefreshTokenSessionRepository } from "../../../src/infrastructure/repositories/PrismaRefreshTokenSessionRepository.js";

import { Argon2PasswordHasher } from "../../../src/infrastructure/security/Argon2PasswordHasher.js";
import { RegisterUserUseCase } from "../../../src/application/use-cases/auth/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../src/application/use-cases/auth/LoginUserUseCase.js";

import { ConfigService } from "../../../src/infrastructure/config/ConfigService.js";
import { LogoutUseCase } from "../../../src/application/use-cases/auth/LogoutUseCase.js";

import { JwtTokenService } from "../../../src/infrastructure/security/JwtTokenService.js";
import { RefreshTokenUseCase } from "../../../src/application/use-cases/auth/RefreshTokenUseCase.js";
import { GetCurrentUserUseCase } from "../../../src/application/use-cases/users/GetCurrentUserUseCase.js";
import { RedisRegistrationStore } from "../../../src/infrastructure/redis/RedisRegistrationStore.js";
import { Argon2OtpService } from "../../../src/infrastructure/security/Argon2OtpService.js";
import { EmailService } from "../../../src/infrastructure/email/EmailService.js";
import { VerifyEmailUseCase } from "../../../src/application/use-cases/auth/VerifyEmailUseCase.js";
import { ResendVerificationUseCase } from "../../../src/application/use-cases/auth/ResendVerificationUseCase.js";
import { PrismaUnitOfWork } from "../../../src/infrastructure/database/PrismaUnitOfWork.js";
const configService = new ConfigService();
const tokenService = new JwtTokenService(configService);
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
});

const appLogger = new PinoLogger(logger);

const userRepository = new PrismaUserRepository(prisma);

const passwordHasher = new Argon2PasswordHasher();

const registrationStore = new RedisRegistrationStore();

const otpService = new Argon2OtpService();
const emailService = new EmailService();
const unitOfWork = new PrismaUnitOfWork(prisma);

const verifyEmailUseCase = new VerifyEmailUseCase(
  userRepository,
  registrationStore,
  otpService,
  appLogger,
  unitOfWork
);

const resendVerificationUseCase = new ResendVerificationUseCase(
  registrationStore,
  otpService,
  emailService,
  appLogger,
);

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
  otpService,
  registrationStore,
  appLogger,
  emailService,
);

const logoutUseCase = new LogoutUseCase(
  tokenService,
  refreshTokenSessionRepository,
  logger,
);

const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository, logger);

export const container = {
  userRepository,

  passwordHasher,

  logger: appLogger,

  configService,
  tokenService,

  loginUserUseCase,
  registerUserUseCase,
  refreshTokenSessionRepository,
  refreshTokenUseCase,
  logoutUseCase,
  getCurrentUserUseCase,
  registrationStore,
  otpService,
  emailService,
  verifyEmailUseCase,
  resendVerificationUseCase,
  unitOfWork
};
