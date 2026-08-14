import pino from "pino";

// Logging
import { PinoLogger } from "../../../src/infrastructure/logging/PinoLogger.js";

// Database
import { prisma } from "../../../src/infrastructure/database/prisma/PrismaClient.js";
import { PrismaUnitOfWork } from "../../../src/infrastructure/database/PrismaUnitOfWork.js";
import { PrismaUserRepository } from "../../../src/infrastructure/repositories/PrismaUserRepository.js";
import { PrismaRefreshTokenSessionRepository } from "../../../src/infrastructure/repositories/PrismaRefreshTokenSessionRepository.js";
import { PrismaOutboxRepository } from "../../../src/infrastructure/outbox/PrismaOutboxRepository.js";

// Security
import { Argon2PasswordHasher } from "../../../src/infrastructure/security/Argon2PasswordHasher.js";
import { Argon2OtpService } from "../../../src/infrastructure/security/Argon2OtpService.js";
import { JwtTokenService } from "../../../src/infrastructure/security/JwtTokenService.js";

// Configuration
import { ConfigService } from "../../../src/infrastructure/config/ConfigService.js";

// Redis
import { RedisRegistrationStore } from "../../../src/infrastructure/redis/RedisRegistrationStore.js";

// Email
import { EmailService } from "../../../src/infrastructure/email/EmailService.js";

// Auth use cases
import { RegisterUserUseCase } from "../../../src/application/use-cases/auth/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../src/application/use-cases/auth/LoginUserUseCase.js";
import { LogoutUseCase } from "../../../src/application/use-cases/auth/LogoutUseCase.js";
import { RefreshTokenUseCase } from "../../../src/application/use-cases/auth/RefreshTokenUseCase.js";
import { VerifyEmailUseCase } from "../../../src/application/use-cases/auth/VerifyEmailUseCase.js";
import { ResendVerificationUseCase } from "../../../src/application/use-cases/auth/ResendVerificationUseCase.js";

// User use cases
import { GetCurrentUserUseCase } from "../../../src/application/use-cases/users/GetCurrentUserUseCase.js";

// Messaging
import { rabbitmqClient } from "../../../src/infrastructure/messaging/rabbitmq/rabbitmqClient.js";
import { RabbitMQPublisher } from "../../../src/infrastructure/messaging/rabbitmq/RabbitMQPublisher.js";
import { WelcomeEmailConsumer } from "../../../src/infrastructure/messaging/rabbitmq/WelcomeEmailConsumer.js";

// Outbox
import { OutboxWorker } from "../../../src/application/services/outbox/OutboxWorker.js";

//Inbox
import { PrismaInboxRepository } from "../../../src/infrastructure/inbox/PrismaInboxRepository.js";

// -----------------------------------------------------
// Configuration
// -----------------------------------------------------

const configService = new ConfigService();

// -----------------------------------------------------
// Logger
// -----------------------------------------------------

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
});

const appLogger = new PinoLogger(logger);

// -----------------------------------------------------
// Security
// -----------------------------------------------------

const passwordHasher = new Argon2PasswordHasher();

const otpService = new Argon2OtpService();

const tokenService = new JwtTokenService(configService);

// -----------------------------------------------------
// Redis
// -----------------------------------------------------

const registrationStore = new RedisRegistrationStore();

// -----------------------------------------------------
// Email
// -----------------------------------------------------

const emailService = new EmailService();

// -----------------------------------------------------
// Database repositories
// -----------------------------------------------------

const userRepository = new PrismaUserRepository(prisma);

const refreshTokenSessionRepository = new PrismaRefreshTokenSessionRepository(
  prisma,
);

const outboxRepository = new PrismaOutboxRepository(prisma);

// -----------------------------------------------------
// Unit of Work
// -----------------------------------------------------

const unitOfWork = new PrismaUnitOfWork(prisma);

// -----------------------------------------------------
// RabbitMQ
// -----------------------------------------------------

export const rabbitMQClient = new rabbitmqClient();

const messagePublisher = new RabbitMQPublisher(rabbitMQClient);

// -----------------------------------------------------
// Inbox Worker
// -----------------------------------------------------

const inboxRepository = new PrismaInboxRepository(prisma);

// -----------------------------------------------------
// RabbitMQ Consumer
// -----------------------------------------------------

export const welcomeEmailConsumer = new WelcomeEmailConsumer(
  rabbitMQClient,
  emailService,
  logger,
  inboxRepository,
);

// -----------------------------------------------------
// Outbox Worker
// -----------------------------------------------------

export const outboxWorker = new OutboxWorker(
  outboxRepository,
  appLogger,
  messagePublisher,
);

// -----------------------------------------------------
// Auth Use Cases
// -----------------------------------------------------

const verifyEmailUseCase = new VerifyEmailUseCase(
  userRepository,
  registrationStore,
  otpService,
  appLogger,
  unitOfWork,
);

const resendVerificationUseCase = new ResendVerificationUseCase(
  registrationStore,
  otpService,
  emailService,
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

const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
  tokenService,
  refreshTokenSessionRepository,
  appLogger,
);

const refreshTokenUseCase = new RefreshTokenUseCase(
  tokenService,
  refreshTokenSessionRepository,
  appLogger,
);

const logoutUseCase = new LogoutUseCase(
  tokenService,
  refreshTokenSessionRepository,
  appLogger,
);

// -----------------------------------------------------
// User Use Cases
// -----------------------------------------------------

const getCurrentUserUseCase = new GetCurrentUserUseCase(
  userRepository,
  appLogger,
);

// -----------------------------------------------------
// Container
// -----------------------------------------------------

export const container = {
  // Infrastructure
  userRepository,
  refreshTokenSessionRepository,
  outboxRepository,

  registrationStore,
  otpService,

  passwordHasher,
  tokenService,

  emailService,

  configService,

  // Database
  unitOfWork,

  // Messaging
  rabbitMQClient,
  messagePublisher,

  // Workers / Consumers
  outboxWorker,
  welcomeEmailConsumer,

  // Logging
  logger: appLogger,

  // Auth
  registerUserUseCase,
  loginUserUseCase,
  logoutUseCase,
  refreshTokenUseCase,
  verifyEmailUseCase,
  resendVerificationUseCase,

  // User
  getCurrentUserUseCase,

  //inbox
  inboxRepository,
};
