import { RegisterUserCommand } from "../../src/application/modules/auth/commands/RegisterUserCommand.js";
import { RegisterUserCommandHandler } from "../../src/application/modules/auth/commands/RegisterUserCommandHandler.js";
import { LoginUserCommand } from "../../src/application/modules/auth/commands/LoginUserCommand.js";
import { LoginUserCommandHandler } from "../../src/application/modules/auth/commands/LoginUserCommandHandler.js";
import { RefreshTokenCommand } from "../../src/application/modules/auth/commands/RefreshTokenCommand.js";
import { RefreshTokenCommandHandler } from "../../src/application/modules/auth/commands/RefreshTokenCommandHandler.js";
import { LogoutCommand } from "../../src/application/modules/auth/commands/LogoutCommand.js";
import { LogoutCommandHandler } from "../../src/application/modules/auth/commands/LogoutCommandHandler.js";
import { VerifyEmailCommand } from "../../src/application/modules/auth/commands/VerifyEmailCommand.js";
import { VerifyEmailCommandHandler } from "../../src/application/modules/auth/commands/VerifyEmailCommandHandler.js";
import { ResendVerificationCommand } from "../../src/application/modules/auth/commands/ResendVerificationCommand.js";
import { ResendVerificationCommandHandler } from "../../src/application/modules/auth/commands/ResendVerificationCommandHandler.js";
import { RequestForgotPasswordCommand } from "../../src/application/modules/auth/commands/RequestForgotPasswordCommand.js";
import { RequestForgotPasswordCommandHandler } from "../../src/application/modules/auth/commands/RequestForgotPasswordCommandHandler.js";
import { ResendForgotPasswordCommand } from "../../src/application/modules/auth/commands/ResendForgotPasswordCommand.js";
import { ResendForgotPasswordCommandHandler } from "../../src/application/modules/auth/commands/ResendForgotPasswordCommandHandler.js";
import { VerifyForgotPasswordCommand } from "../../src/application/modules/auth/commands/VerifyForgotPasswordCommand.js";
import { VerifyForgotPasswordCommandHandler } from "../../src/application/modules/auth/commands/VerifyForgotPasswordCommandHandler.js";
import { ResetPasswordCommand } from "../../src/application/modules/auth/commands/ResetPasswordCommand.js";
import { ResetPasswordCommandHandler } from "../../src/application/modules/auth/commands/ResetPasswordCommandHandler.js";
import { VerifyLoginOtpCommand } from "../../src/application/modules/auth/commands/VerifyLoginOtpCommand.js";
import { VerifyLoginOtpCommandHandler } from "../../src/application/modules/auth/commands/VerifyLoginOtpCommandHandler.js";
import { GetCurrentUserQuery } from "../../src/application/modules/users/queries/GetCurrentUserQuery.js";
import { GetCurrentUserQueryHandler } from "../../src/application/modules/users/queries/GetCurrentUserQueryHandler.js";
import { GetAllUsersQuery } from "../../src/application/modules/users/queries/GetAllUsersQuery.js";
import { GetAllUsersQueryHandler } from "../../src/application/modules/users/queries/GetAllUsersQueryHandler.js";
import { GetUserByIdQuery } from "../../src/application/modules/users/queries/GetUserByIdQuery.js";
import { GetUserByIdQueryHandler } from "../../src/application/modules/users/queries/GetUserByIdQueryHandler.js";
import { AssignRoleToUserCommand } from "../../src/application/modules/user-roles/commands/AssignRoleToUserCommand.js";
import { AssignRoleToUserCommandHandler } from "../../src/application/modules/user-roles/commands/AssignRoleToUserCommandHandler.js";
import { RemoveRoleFromUserCommand } from "../../src/application/modules/user-roles/commands/RemoveRoleFromUserCommand.js";
import { RemoveRoleFromUserCommandHandler } from "../../src/application/modules/user-roles/commands/RemoveRoleFromUserCommandHandler.js";
import { GetUserRolesQuery } from "../../src/application/modules/user-roles/queries/GetUserRolesQuery.js";
import { GetUserRolesQueryHandler } from "../../src/application/modules/user-roles/queries/GetUserRolesQueryHandler.js";
import { AssignPermissionToRoleCommand } from "../../src/application/modules/role-permissions/commands/AssignPermissionToRoleCommand.js";
import { AssignPermissionToRoleCommandHandler } from "../../src/application/modules/role-permissions/commands/AssignPermissionToRoleCommandHandler.js";
import { RemovePermissionFromRoleCommand } from "../../src/application/modules/role-permissions/commands/RemovePermissionFromRoleCommand.js";
import { RemovePermissionFromRoleCommandHandler } from "../../src/application/modules/role-permissions/commands/RemovePermissionFromRoleCommandHandler.js";
import { GetRolePermissionsQuery } from "../../src/application/modules/role-permissions/queries/GetRolePermissionsQuery.js";
import { GetRolePermissionsQueryHandler } from "../../src/application/modules/role-permissions/queries/GetRolePermissionsQueryHandler.js";
import { GetAllPermissionsQuery } from "../../src/application/modules/role-permissions/queries/GetAllPermissionsQuery.js";
import { GetAllPermissionsQueryHandler } from "../../src/application/modules/role-permissions/queries/GetAllPermissionsQueryHandler.js";
import pino from "pino";

// Logging
import { PinoLogger } from "../../src/infrastructure/logging/PinoLogger.js";

// Database
import { prisma } from "../../src/infrastructure/persistence/prisma/PrismaClient.js";
import { PrismaUnitOfWork } from "../../src/infrastructure/persistence/prisma/PrismaUnitOfWork.js";
import { PrismaUserRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaUserRepository.js";
import { PrismaRefreshTokenSessionRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaRefreshTokenSessionRepository.js";
import { PrismaTrustedDeviceRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaTrustedDeviceRepository.js";
import { PrismaOutboxRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaOutboxRepository.js";

// Security
import { Argon2PasswordHasher } from "../../src/infrastructure/security/Argon2PasswordHasher.js";
import { Argon2OtpService } from "../../src/infrastructure/security/Argon2OtpService.js";
import { JwtTokenService } from "../../src/infrastructure/security/JwtTokenService.js";

// Configuration
import { ConfigService } from "../../src/infrastructure/config/ConfigService.js";

// Redis
import { RedisRegistrationStore } from "../../src/infrastructure/cache/RedisRegistrationStore.js";
import { RedisPasswordResetStore } from "../../src/infrastructure/cache/RedisPasswordResetStore.js";
import { PendingLoginRedisStore } from "../../src/infrastructure/cache/PendingLoginRedisStore.js";
import { redisClient } from "../../src/infrastructure/cache/redisClient.js";

// Email
import { EmailService } from "../../src/infrastructure/email/EmailService.js";

// Auth use cases
import { CheckLoginDeviceUseCase } from "../../src/application/modules/auth/use-cases/CheckLoginDeviceUseCase.js";
import { CreateLoginVerificationUseCase } from "../../src/application/modules/auth/use-cases/CreateLoginVerificationUseCase.js";

// User use cases

// Messaging
import { rabbitmqClient } from "../../src/infrastructure/messaging/rabbitmq/rabbitmqClient.js";
import { RabbitMQPublisher } from "../../src/infrastructure/messaging/rabbitmq/RabbitMQPublisher.js";
import { WelcomeEmailConsumer } from "../../src/infrastructure/messaging/rabbitmq/WelcomeEmailConsumer.js";
import { UserReadModelConsumer } from "../../src/infrastructure/messaging/rabbitmq/UserReadModelConsumer.js";
import { MongoUserProjector } from "../../src/infrastructure/persistence/mongodb/read-models/MongoUserProjector.js";

// Outbox
import { OutboxWorker } from "../../src/application/workers/OutboxWorker.js";

//Inbox
import { PrismaInboxRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaInboxRepository.js";
import { EmailJobQueue } from "../../src/infrastructure/messaging/rabbitmq/EmailJobQueue.js";
import { EmailWorker } from "../../src/infrastructure/messaging/rabbitmq/EmailWorker.js";
import { PrismaRoleRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaRoleRepository.js";
import { CommandBus } from "../../src/application/bus/CommandBus.js";
import { QueryBus } from "../../src/application/bus/QueryBus.js";
import { CreateRoleCommand } from "../../src/application/modules/roles/commands/CreateRoleCommand.js";
import { CreateRoleCommandHandler } from "../../src/application/modules/roles/commands/CreateRoleCommandHandler.js";
import { UpdateRoleCommand } from "../../src/application/modules/roles/commands/UpdateRoleCommand.js";
import { UpdateRoleCommandHandler } from "../../src/application/modules/roles/commands/UpdateRoleCommandHandler.js";
import { DeleteRoleCommand } from "../../src/application/modules/roles/commands/DeleteRoleCommand.js";
import { DeleteRoleCommandHandler } from "../../src/application/modules/roles/commands/DeleteRoleCommandHandler.js";
import { GetRoleQuery } from "../../src/application/modules/roles/queries/GetRoleQuery.js";
import { GetRoleQueryHandler } from "../../src/application/modules/roles/queries/GetRoleQueryHandler.js";
import { GetAllRolesQuery } from "../../src/application/modules/roles/queries/GetAllRolesQuery.js";
import { GetAllRolesQueryHandler } from "../../src/application/modules/roles/queries/GetAllRolesQueryHandler.js";
import { PrismaAuthorizationRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaAuthorizationRepository.js";
import { AuthorizationService } from "../../src/application/modules/authorization/AuthorizationService.js";
import { permissionRegistry } from "../../src/application/modules/authorization/PermissionRegistry.js";
import { PermissionDefinitions } from "../../src/application/modules/authorization/PermissionDefinitions.js";
import { PrismaPermissionRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaPermissionRepository.js";
import { PermissionSynchronizer } from "../../src/application/modules/authorization/PermissionSynchronizer.js";
import { PrismaRolePermissionRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaRolePermissionRepository.js";
import { PrismaUserRoleRepository } from "../../src/infrastructure/persistence/prisma/repositories/PrismaUserRoleRepository.js";
import { RedisAuthorizationCache } from "../../src/infrastructure/cache/RedisAuthorizationCache.js";
import { MongoDatabase } from "../../src/infrastructure/persistence/mongodb/MongoDatabase.js";
import { getMongoClient } from "../../src/infrastructure/persistence/mongodb/MongoConnection.js";
import { MongoUserReader } from "../../src/infrastructure/persistence/mongodb/read-models/MongoUserReader.js";
import { MongoReadModelSynchronizer } from "../../src/infrastructure/persistence/mongodb/read-models/MongoReadModelSynchronizer.js";
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
