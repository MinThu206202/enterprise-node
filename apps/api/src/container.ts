import pino from "pino";

import { PinoLogger } from "../../../src/infrastructure/logging/PinoLogger.js";
import type { ILogger } from "../../../src/shared/logging/ILogger.js";
import { prisma } from "../../../src/infrastructure/database/prisma/PrismaClient.js";
import { PrismaUserRepository } from "../../../src/infrastructure/repositories/PrismaUserRepository.js";
import { CreateUserUseCase } from "../../../src/application/use-cases/users/CreateUserUseCase.js";
import { ConfigService } from "../../../src/infrastructure/config/ConfigService.js";

export const config = new ConfigService();
const userRepository = new PrismaUserRepository(prisma);
const pinoInstance = pino({
  level: config.logLevel,
});

export const logger: ILogger = new PinoLogger(pinoInstance);

const createUserUseCase = new CreateUserUseCase(userRepository,logger);

export const container = {
  userRepository,
  createUserUseCase,
  config,
};
