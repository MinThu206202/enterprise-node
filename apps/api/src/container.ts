import { RegisterUserCommand } from "../../../src/application/commands/auth/RegisterUserCommand.js";
import { RegisterUserCommandHandler } from "../../../src/application/commands/auth/RegisterUserCommandHandler.js";
import { LoginUserCommand } from "../../../src/application/commands/auth/LoginUserCommand.js";
import { LoginUserCommandHandler } from "../../../src/application/commands/auth/LoginUserCommandHandler.js";
import { RefreshTokenCommand } from "../../../src/application/commands/auth/RefreshTokenCommand.js";
import { RefreshTokenCommandHandler } from "../../../src/application/commands/auth/RefreshTokenCommandHandler.js";
import { LogoutCommand } from "../../../src/application/commands/auth/LogoutCommand.js";
import { LogoutCommandHandler } from "../../../src/application/commands/auth/LogoutCommandHandler.js";
import { VerifyEmailCommand } from "../../../src/application/commands/auth/VerifyEmailCommand.js";
import { VerifyEmailCommandHandler } from "../../../src/application/commands/auth/VerifyEmailCommandHandler.js";
import { ResendVerificationCommand } from "../../../src/application/commands/auth/ResendVerificationCommand.js";
import { ResendVerificationCommandHandler } from "../../../src/application/commands/auth/ResendVerificationCommandHandler.js";
import { RequestForgotPasswordCommand } from "../../../src/application/commands/auth/RequestForgotPasswordCommand.js";
import { RequestForgotPasswordCommandHandler } from "../../../src/application/commands/auth/RequestForgotPasswordCommandHandler.js";
import { ResendForgotPasswordCommand } from "../../../src/application/commands/auth/ResendForgotPasswordCommand.js";
import { ResendForgotPasswordCommandHandler } from "../../../src/application/commands/auth/ResendForgotPasswordCommandHandler.js";
import { VerifyForgotPasswordCommand } from "../../../src/application/commands/auth/VerifyForgotPasswordCommand.js";
import { VerifyForgotPasswordCommandHandler } from "../../../src/application/commands/auth/VerifyForgotPasswordCommandHandler.js";
import { ResetPasswordCommand } from "../../../src/application/commands/auth/ResetPasswordCommand.js";
import { ResetPasswordCommandHandler } from "../../../src/application/commands/auth/ResetPasswordCommandHandler.js";
import { VerifyLoginOtpCommand } from "../../../src/application/commands/auth/VerifyLoginOtpCommand.js";
import { VerifyLoginOtpCommandHandler } from "../../../src/application/commands/auth/VerifyLoginOtpCommandHandler.js";
import { GetCurrentUserQuery } from "../../../src/application/queries/users/GetCurrentUserQuery.js";
import { GetCurrentUserQueryHandler } from "../../../src/application/queries/users/GetCurrentUserQueryHandler.js";
import { GetAllUsersQuery } from "../../../src/application/queries/users/GetAllUsersQuery.js";
import { GetAllUsersQueryHandler } from "../../../src/application/queries/users/GetAllUsersQueryHandler.js";
import { GetUserByIdQuery } from "../../../src/application/queries/users/GetUserByIdQuery.js";
import { GetUserByIdQueryHandler } from "../../../src/application/queries/users/GetUserByIdQueryHandler.js";
import { AssignRoleToUserCommand } from "../../../src/application/commands/userRoles/AssignRoleToUserCommand.js";
import { AssignRoleToUserCommandHandler } from "../../../src/application/commands/userRoles/AssignRoleToUserCommandHandler.js";
import { RemoveRoleFromUserCommand } from "../../../src/application/commands/userRoles/RemoveRoleFromUserCommand.js";
import { RemoveRoleFromUserCommandHandler } from "../../../src/application/commands/userRoles/RemoveRoleFromUserCommandHandler.js";
import { GetUserRolesQuery } from "../../../src/application/queries/userRoles/GetUserRolesQuery.js";
import { GetUserRolesQueryHandler } from "../../../src/application/queries/userRoles/GetUserRolesQueryHandler.js";
import { AssignPermissionToRoleCommand } from "../../../src/application/commands/rolePermissions/AssignPermissionToRoleCommand.js";
import { AssignPermissionToRoleCommandHandler } from "../../../src/application/commands/rolePermissions/AssignPermissionToRoleCommandHandler.js";
import { RemovePermissionFromRoleCommand } from "../../../src/application/commands/rolePermissions/RemovePermissionFromRoleCommand.js";
import { RemovePermissionFromRoleCommandHandler } from "../../../src/application/commands/rolePermissions/RemovePermissionFromRoleCommandHandler.js";
import { GetRolePermissionsQuery } from "../../../src/application/queries/rolePermissions/GetRolePermissionsQuery.js";
import { GetRolePermissionsQueryHandler } from "../../../src/application/queries/rolePermissions/GetRolePermissionsQueryHandler.js";
import { GetAllPermissionsQuery } from "../../../src/application/queries/rolePermissions/GetAllPermissionsQuery.js";
import { GetAllPermissionsQueryHandler } from "../../../src/application/queries/rolePermissions/GetAllPermissionsQueryHandler.js";
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
import { CheckLoginDeviceUseCase } from "../../../src/application/use-cases/auth/CheckLoginDeviceUseCase.js";
import { CreateLoginVerificationUseCase } from "../../../src/application/use-cases/auth/CreateLoginVerificationUseCase.js";

// User use cases

// Messaging
import { rabbitmqClient } from "../../../src/infrastructure/messaging/rabbitmq/rabbitmqClient.js";
import { RabbitMQPublisher } from "../../../src/infrastructure/messaging/rabbitmq/RabbitMQPublisher.js";
import { WelcomeEmailConsumer } from "../../../src/infrastructure/messaging/rabbitmq/WelcomeEmailConsumer.js";
import { UserReadModelConsumer } from "../../../src/infrastructure/messaging/rabbitmq/UserReadModelConsumer.js";
import { MongoUserProjector } from "../../../src/infrastructure/read-models/mongodb/MongoUserProjector.js";

// Outbox
import { OutboxWorker } from "../../../src/application/services/outbox/OutboxWorker.js";

//Inbox
import { PrismaInboxRepository } from "../../../src/infrastructure/inbox/PrismaInboxRepository.js";
import { EmailJobQueue } from "../../../src/infrastructure/messaging/rabbitmq/EmailJobQueue.js";
import { EmailWorker } from "../../../src/infrastructure/messaging/rabbitmq/EmailWorker.js";
import { PrismaRoleRepository } from "../../../src/infrastructure/repositories/PrismaRoleRepository.js";
import { CommandBus } from "../../../src/application/bus/CommandBus.js";
import { QueryBus } from "../../../src/application/bus/QueryBus.js";
import { CreateRoleCommand } from "../../../src/application/commands/roles/CreateRoleCommand.js";
import { CreateRoleCommandHandler } from "../../../src/application/commands/roles/CreateRoleCommandHandler.js";
import { UpdateRoleCommand } from "../../../src/application/commands/roles/UpdateRoleCommand.js";
import { UpdateRoleCommandHandler } from "../../../src/application/commands/roles/UpdateRoleCommandHandler.js";
import { DeleteRoleCommand } from "../../../src/application/commands/roles/DeleteRoleCommand.js";
import { DeleteRoleCommandHandler } from "../../../src/application/commands/roles/DeleteRoleCommandHandler.js";
import { GetRoleQuery } from "../../../src/application/queries/roles/GetRoleQuery.js";
import { GetRoleQueryHandler } from "../../../src/application/queries/roles/GetRoleQueryHandler.js";
import { GetAllRolesQuery } from "../../../src/application/queries/roles/GetAllRolesQuery.js";
import { GetAllRolesQueryHandler } from "../../../src/application/queries/roles/GetAllRolesQueryHandler.js";
import { PrismaAuthorizationRepository } from "../../../src/infrastructure/repositories/PrismaAuthorizationRepository.js";
import { AuthorizationService } from "../../../src/application/services/authorization/AuthorizationService.js";
import { permissionRegistry } from "../../../src/application/services/authorization/PermissionRegistry.js";
import { PermissionDefinitions } from "../../../src/application/services/authorization/PermissionDefinitions.js";
import { PrismaPermissionRepository } from "../../../src/infrastructure/repositories/PrismaPermissionRepository.js";
import { PermissionSynchronizer } from "../../../src/application/services/authorization/PermissionSynchronizer.js";
import { PrismaRolePermissionRepository } from "../../../src/infrastructure/repositories/PrismaRolePermissionRepository.js";
import { PrismaUserRoleRepository } from "../../../src/infrastructure/repositories/PrismaUserRoleRepository.js";
import { RedisAuthorizationCache } from "../../../src/infrastructure/redis/RedisAuthorizationCache.js";
import { MongoDatabase } from "../../../src/infrastructure/database/mongodb/MongoDatabase.js";
import { getMongoClient } from "../../../src/infrastructure/database/mongodb/MongoConnection.js";
import { MongoUserReader } from "../../../src/infrastructure/read-models/mongodb/MongoUserReader.js";
import { MongoReadModelSynchronizer } from "../../../src/infrastructure/read-models/mongodb/MongoReadModelSynchronizer.js";
// -----------------------------------------------------
// Register permission modules
// -----------------------------------------------------

for (const definition of PermissionDefinitions) {
  permissionRegistry.register(definition);
}

export const mongoClient = getMongoClient();

const mongoDatabase = new MongoDatabase(mongoClient);

const userReader = new MongoUserReader(mongoDatabase);

export const readModelSynchronizer = new MongoReadModelSynchronizer(
  prisma,
  mongoDatabase,
);
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
// User Read Model Projection
// -----------------------------------------------------

const mongoUserProjector = new MongoUserProjector(mongoDatabase);

export const userReadModelConsumer = new UserReadModelConsumer(
  rabbitMQClient,
  mongoUserProjector,
  inboxRepository,
  appLogger,
);

// -----------------------------------------------------
// Role
// -----------------------------------------------------
const roleRepository = new PrismaRoleRepository(prisma);

const authorizationRepository = new PrismaAuthorizationRepository(prisma);

const authorizationCache = new RedisAuthorizationCache();

const permissionRepository = new PrismaPermissionRepository(prisma);

export const permissionSynchronizer = new PermissionSynchronizer(
  permissionRepository,
);

const rolePermissionRepository = new PrismaRolePermissionRepository(prisma);



const authorizationService = new AuthorizationService(
  authorizationRepository,
  authorizationCache,
);

const commandBus = new CommandBus();

const queryBus = new QueryBus();

const userRoleRepository = new PrismaUserRoleRepository(prisma);

commandBus.register(
  CreateRoleCommand.COMMAND_TYPE,
  new CreateRoleCommandHandler(roleRepository),
);

commandBus.register(
  UpdateRoleCommand.COMMAND_TYPE,
  new UpdateRoleCommandHandler(
    roleRepository,
    userRoleRepository,
    authorizationCache,
  ),
);

commandBus.register(
  DeleteRoleCommand.COMMAND_TYPE,
  new DeleteRoleCommandHandler(
    roleRepository,
    userRoleRepository,
    authorizationCache,
  ),
);

queryBus.register(
  GetRoleQuery.QUERY_TYPE,
  new GetRoleQueryHandler(roleRepository),
);

queryBus.register(
  GetAllRolesQuery.QUERY_TYPE,
  new GetAllRolesQueryHandler(roleRepository),
);


// -----------------------------------------------------
// Assing ROle
// -----------------------------------------------------




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








const checkLoginDeviceUseCase = new CheckLoginDeviceUseCase(
  trustedDeviceRepository,
);

const createLoginVerificationUseCase = new CreateLoginVerificationUseCase(
  otpService,
  pendingLoginStore,
  emailService,
);





// -----------------------------------------------------
// User Use Cases
// -----------------------------------------------------




// -----------------------------------------------------
// Container
// -----------------------------------------------------


// -----------------------------------------------------
// CQRS handler registrations
// -----------------------------------------------------

commandBus.register(
  RegisterUserCommand.COMMAND_TYPE,
  new RegisterUserCommandHandler(
userRepository,
  passwordHasher,
  otpService,
  registrationStore,
  appLogger,
  emailJobQueue,
  ),
);

commandBus.register(
  LoginUserCommand.COMMAND_TYPE,
  new LoginUserCommandHandler(
userRepository,
  passwordHasher,
  tokenService,
  refreshTokenSessionRepository,
  trustedDeviceRepository,
  appLogger,
  checkLoginDeviceUseCase,
  createLoginVerificationUseCase,
  ),
);

commandBus.register(
  RefreshTokenCommand.COMMAND_TYPE,
  new RefreshTokenCommandHandler(
tokenService,
  refreshTokenSessionRepository,
  appLogger,
  ),
);

commandBus.register(
  LogoutCommand.COMMAND_TYPE,
  new LogoutCommandHandler(
tokenService,
  refreshTokenSessionRepository,
  appLogger,
  ),
);

commandBus.register(
  VerifyEmailCommand.COMMAND_TYPE,
  new VerifyEmailCommandHandler(
userRepository,
  registrationStore,
  otpService,
  appLogger,
  unitOfWork,
  trustedDeviceRepository,
  ),
);

commandBus.register(
  ResendVerificationCommand.COMMAND_TYPE,
  new ResendVerificationCommandHandler(
registrationStore,
  otpService,
  emailService,
  appLogger,
  ),
);

commandBus.register(
  RequestForgotPasswordCommand.COMMAND_TYPE,
  new RequestForgotPasswordCommandHandler(
userRepository,
  passwordResetStore,
  otpService,
  appLogger,
  emailJobQueue,
  ),
);

commandBus.register(
  ResendForgotPasswordCommand.COMMAND_TYPE,
  new ResendForgotPasswordCommandHandler(
passwordResetStore,
  otpService,
  emailJobQueue,
  appLogger,
  ),
);

commandBus.register(
  VerifyForgotPasswordCommand.COMMAND_TYPE,
  new VerifyForgotPasswordCommandHandler(
passwordResetStore,
  otpService,
  tokenService,
  appLogger,
  ),
);

commandBus.register(
  ResetPasswordCommand.COMMAND_TYPE,
  new ResetPasswordCommandHandler(
tokenService,
  passwordResetStore,
  passwordHasher,
  userRepository,
  appLogger,
  ),
);

commandBus.register(
  VerifyLoginOtpCommand.COMMAND_TYPE,
  new VerifyLoginOtpCommandHandler(
pendingLoginStore,
  otpService,
  tokenService,
  refreshTokenSessionRepository,
  trustedDeviceRepository,
  appLogger,
  ),
);

queryBus.register(
  GetCurrentUserQuery.QUERY_TYPE,
  new GetCurrentUserQueryHandler(
userReader, appLogger
  ),
);

queryBus.register(
  GetAllUsersQuery.QUERY_TYPE,
  new GetAllUsersQueryHandler(
userReader, appLogger
  ),
);

queryBus.register(
  GetUserByIdQuery.QUERY_TYPE,
  new GetUserByIdQueryHandler(
userReader, appLogger
  ),
);

commandBus.register(
  AssignRoleToUserCommand.COMMAND_TYPE,
  new AssignRoleToUserCommandHandler(
userRepository,
  roleRepository,
  userRoleRepository,
  authorizationCache,
  unitOfWork,
  ),
);

commandBus.register(
  RemoveRoleFromUserCommand.COMMAND_TYPE,
  new RemoveRoleFromUserCommandHandler(
userRepository,
  roleRepository,
  userRoleRepository,
  authorizationCache,
  unitOfWork,
  ),
);

queryBus.register(
  GetUserRolesQuery.QUERY_TYPE,
  new GetUserRolesQueryHandler(
userRoleRepository,
  roleRepository,
  ),
);

commandBus.register(
  AssignPermissionToRoleCommand.COMMAND_TYPE,
  new AssignPermissionToRoleCommandHandler(
rolePermissionRepository,
  userRoleRepository,
  authorizationCache,
  ),
);

commandBus.register(
  RemovePermissionFromRoleCommand.COMMAND_TYPE,
  new RemovePermissionFromRoleCommandHandler(
rolePermissionRepository,
  userRoleRepository,
  authorizationCache,
  ),
);

queryBus.register(
  GetRolePermissionsQuery.QUERY_TYPE,
  new GetRolePermissionsQueryHandler(
rolePermissionRepository,
  ),
);

queryBus.register(
  GetAllPermissionsQuery.QUERY_TYPE,
  new GetAllPermissionsQueryHandler(
permissionRepository,
  ),
);

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

  // Forgot password

  // Login OTP

  // User
  userReader,
  readModelSynchronizer,
  mongoClient,
  mongoDatabase,

  //inbox
  inboxRepository,

  //email worker
  emailJobQueue,
  emailWorker,

  permissionRegistry,
  permissionRepository,

  authorizationCache,

  roleRepository,
  rolePermissionRepository,
  authorizationRepository,
  authorizationService,
  commandBus,
  queryBus,
  permissionSynchronizer,
  userRoleRepository,
};
