import type { PrismaClient } from "../../../generated/prisma/client.js";

import type { IUnitOfWork } from "../../../application/ports/database/IUnitOfWork.js";

import type { ITransactionContext } from "../../../application/ports/database/ITransactionContext.js";

import { PrismaUserRepository } from "./repositories/PrismaUserRepository.js";
import { PrismaOutboxRepository } from "./repositories/PrismaOutboxRepository.js";
import { PrismaRolePermissionRepository } from "./repositories/PrismaRolePermissionRepository.js";
import { PrismaRoleRepository } from "./repositories/PrismaRoleRepository.js";
import { PrismaUserRoleRepository } from "./repositories/PrismaUserRoleRepository.js";

export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async execute<T>(
    callback: (context: ITransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const context: ITransactionContext = {
        userRepository: new PrismaUserRepository(tx),
        outboxRepository: new PrismaOutboxRepository(tx),
        roleRepository: new PrismaRoleRepository(tx),
        userRoleRepository: new PrismaUserRoleRepository(tx),
        rolePermissionRepository: new PrismaRolePermissionRepository(tx),
      };

      return callback(context);
    });
  }
}
