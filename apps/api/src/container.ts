import pino from "pino";

// Logging
import { PinoLogger } from "../../../src/infrastructure/logging/PinoLogger.js";

// Database
import { prisma } from "../../../src/infrastructure/database/prisma/PrismaClient.js";
import { PrismaUnitOfWork } from "../../../src/infrastructure/database/PrismaUnitOfWork.js";
import { PrismaUserRepository } from "../../../src/infrastructure/repositories/PrismaUserRepository.js";
import { PrismaRefreshTokenSessionRepository } from "../../../src/infrastructure/repositories/PrismaRefreshTokenSessionRepository.js";
import { PrismaTrustedDeviceRepository } from "../../../src/infrastructure/repositories/PrismaTrustedDeviceRepository.js";
import { PrismaOutboxRepository } from "../../../src/infrastructure/outbox/PrismaOutboxRepository.js";

// Security
import { Argon2PasswordHasher } from "../../../src/infrastructure/security/Argon2PasswordHasher.js";
import { Argon2OtpService } from "../../../src/infrastructure/security/Argon2OtpService.js";
import { JwtTokenService } from "../../../src/infrastructure/security/JwtTokenService.js";

// Configuration
import { ConfigService } from "../../../src/infrastructure/config/ConfigService.js";

// Redis
import { RedisRegistrationStore } from "../../../src/infrastructure/redis/RedisRegistrationStore.js";
import { RedisPasswordResetStore } from "../../../src/infrastructure/redis/RedisPasswordResetStore.js";
import { PendingLoginRedisStore } from "../../../src/infrastructure/redis/PendingLoginRedisStore.js";
import { redisClient } from "../../../src/infrastructure/redis/redisClient.js";

// Email
import { EmailService } from "../../../src/infrastructure/email/EmailService.js";

// Auth use cases
import { RegisterUserUseCase } from "../../../src/application/use-cases/auth/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../src/application/use-cases/auth/LoginUserUseCase.js";
import { LogoutUseCase } from "../../../src/application/use-cases/auth/LogoutUseCase.js";
import { RefreshTokenUseCase } from "../../../src/application/use-cases/auth/RefreshTokenUseCase.js";
import { VerifyEmailUseCase } from "../../../src/application/use-cases/auth/VerifyEmailUseCase.js";
import { ResendVerificationUseCase } from "../../../src/application/use-cases/auth/ResendVerificationUseCase.js";
import { RequestForgotPasswordUseCase } from "../../../src/application/use-cases/auth/RequestForgotPasswordUseCase.js";
import { ResendForgotPasswordUseCase } from "../../../src/application/use-cases/auth/ResendForgotPasswordUseCase.js";
import { VerifyForgotPasswordUseCase } from "../../../src/application/use-cases/auth/VerifyForgotPasswordUseCase.js";
import { ResetPasswordUseCase } from "../../../src/application/use-cases/auth/ResetPasswordUseCase.js";
import { CheckLoginDeviceUseCase } from "../../../src/application/use-cases/auth/CheckLoginDeviceUseCase.js";
import { CreateLoginVerificationUseCase } from "../../../src/application/use-cases/auth/CreateLoginVerificationUseCase.js";
import { VerifyLoginOtpUseCase } from "../../../src/application/use-cases/auth/VerifyLoginOtpUseCase.js";

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
import { EmailJobQueue } from "../../../src/infrastructure/messaging/rabbitmq/EmailJobQueue.js";
import { EmailWorker } from "../../../src/infrastructure/messaging/rabbitmq/EmailWorker.js";
import { PrismaRoleRepository } from "../../../src/infrastructure/repositories/PrismaRoleRepository.js";
import { CreateRoleUseCase } from "../../../src/application/use-cases/roles/CreateRoleUseCase.js";
import { GetRoleUseCase } from "../../../src/application/use-cases/roles/GetRoleUseCase.js";
import { UpdateRoleUseCase } from "../../../src/application/use-cases/roles/UpdateRoleUseCase.js";
import { DeleteRoleUseCase } from "../../../src/application/use-cases/roles/DeleteRoleUseCase.js";
import { GetAllRolesUseCase } from "../../../src/application/use-cases/roles/GetAllRolesUseCase.js";
import { PrismaAuthorizationRepository } from "../../../src/infrastructure/repositories/PrismaAuthorizationRepository.js";
import { AuthorizationService } from "../../../src/application/services/authorization/AuthorizationService.js";
import { permissionRegistry } from "../../../src/application/services/authorization/PermissionRegistry.js";
import { PermissionDefinitions } from "../../../src/application/services/authorization/PermissionDefinitions.js";
import { PrismaPermissionRepository } from "../../../src/infrastructure/repositories/PrismaPermissionRepository.js";
import { PermissionSynchronizer } from "../../../src/application/services/authorization/PermissionSynchronizer.js";
import { PrismaRolePermissionRepository } from "../../../src/infrastructure/repositories/PrismaRolePermissionRepository.js";
import { AssignPermissionToRoleUseCase } from "../../../src/application/use-cases/rolePermissions/AssignPermissionToRoleUseCase.js";
import { RemovePermissionFromRoleUseCase } from "../../../src/application/use-cases/rolePermissions/RemovePermissionFromRoleUseCase.js";
import { GetRolePermissionsUseCase } from "../../../src/application/use-cases/rolePermissions/GetRolePermissionsUseCase.js";
import { AssignRoleToUserUseCase } from "../../../src/application/use-cases/userRoles/AssignRoleToUserUseCase.js";
import { PrismaUserRoleRepository } from "../../../src/infrastructure/repositories/PrismaUserRoleRepository.js";

// -----------------------------------------------------
// Register permission modules
// -----------------------------------------------------

for (const definition of PermissionDefinitions) {
  permissionRegistry.register(definition);
}

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

const passwordResetStore = new RedisPasswordResetStore();

const pendingLoginStore = new PendingLoginRedisStore(redisClient as never);

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

const trustedDeviceRepository = new PrismaTrustedDeviceRepository(prisma);

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
// Role
// -----------------------------------------------------
const roleRepository = new PrismaRoleRepository(prisma);

const authorizationRepository = new PrismaAuthorizationRepository(prisma);

const permissionRepository = new PrismaPermissionRepository(prisma);

export const permissionSynchronizer = new PermissionSynchronizer(
  permissionRepository,
);

const rolePermissionRepository = new PrismaRolePermissionRepository();

const getRolePermissionsUseCase = new GetRolePermissionsUseCase(
  rolePermissionRepository,
);

const assignPermissionToRoleUseCase = new AssignPermissionToRoleUseCase(
  rolePermissionRepository,
);

const removePermissionFromRoleUseCase = new RemovePermissionFromRoleUseCase(
  rolePermissionRepository,
);

const authorizationService = new AuthorizationService(authorizationRepository);

const createRoleUseCase = new CreateRoleUseCase(roleRepository);

const getRoleUseCase = new GetRoleUseCase(roleRepository);

const getAllRolesUseCase = new GetAllRolesUseCase(roleRepository);

const updateRoleUseCase = new UpdateRoleUseCase(roleRepository);

const deleteRoleUseCase = new DeleteRoleUseCase(roleRepository);

// -----------------------------------------------------
// Assing ROle
// -----------------------------------------------------

const userRoleRepository = new PrismaUserRoleRepository(prisma);

const assignRoleToUserUseCase = new AssignRoleToUserUseCase(
  userRepository,
  roleRepository,
  userRoleRepository,
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
// Email Worker
// -----------------------------------------------------

const emailJobQueue = new EmailJobQueue(rabbitMQClient);

export const emailWorker = new EmailWorker(
  rabbitMQClient,
  emailService,
  appLogger,
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
  trustedDeviceRepository,
);

const resendVerificationUseCase = new ResendVerificationUseCase(
  registrationStore,
  otpService,
  emailService,
  appLogger,
);

const requestForgotPasswordUseCase = new RequestForgotPasswordUseCase(
  userRepository,
  passwordResetStore,
  otpService,
  appLogger,
  emailJobQueue,
);

const resendForgotPasswordUseCase = new ResendForgotPasswordUseCase(
  passwordResetStore,
  otpService,
  emailJobQueue,
  appLogger,
);

const verifyForgotPasswordUseCase = new VerifyForgotPasswordUseCase(
  passwordResetStore,
  otpService,
  tokenService,
  appLogger,
);

const resetPasswordUseCase = new ResetPasswordUseCase(
  tokenService,
  passwordResetStore,
  passwordHasher,
  userRepository,
  appLogger,
);

const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  passwordHasher,
  otpService,
  registrationStore,
  appLogger,
  emailJobQueue,
);

const checkLoginDeviceUseCase = new CheckLoginDeviceUseCase(
  trustedDeviceRepository,
);

const createLoginVerificationUseCase = new CreateLoginVerificationUseCase(
  otpService,
  pendingLoginStore,
  emailService,
);

const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
  tokenService,
  refreshTokenSessionRepository,
  trustedDeviceRepository,
  appLogger,
  checkLoginDeviceUseCase,
  createLoginVerificationUseCase,
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

const verifyLoginOtpUseCase = new VerifyLoginOtpUseCase(
  pendingLoginStore,
  otpService,
  tokenService,
  refreshTokenSessionRepository,
  trustedDeviceRepository,
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
  passwordResetStore,
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

  // Forgot password
  requestForgotPasswordUseCase,
  resendForgotPasswordUseCase,
  verifyForgotPasswordUseCase,
  resetPasswordUseCase,

  // Login OTP
  verifyLoginOtpUseCase,

  // User
  getCurrentUserUseCase,

  //inbox
  inboxRepository,

  //email worker
  emailJobQueue,
  emailWorker,

  permissionRegistry,
  permissionRepository,

  roleRepository,
  rolePermissionRepository,
  authorizationRepository,
  authorizationService,
  createRoleUseCase,
  getRoleUseCase,
  getAllRolesUseCase,
  updateRoleUseCase,
  deleteRoleUseCase,
  permissionSynchronizer,
  assignPermissionToRoleUseCase,
  removePermissionFromRoleUseCase,
  getRolePermissionsUseCase,
  assignRoleToUserUseCase,
};
