import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../../ports/authorization/IAuthorizationCache.js";
import type { IUnitOfWork } from "../../../ports/database/IUnitOfWork.js";
import { EVENT_TYPES } from "../../../events/EventTypes.js";
import { ConflictError } from "../../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import type { AssignRoleToUserInput } from "../dto/AssignRoleToUserInput.js";
import { randomUUID } from "node:crypto";
import type { ITransactionContext } from "../../../ports/database/ITransactionContext.js";
import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { AssignRoleToUserCommand } from "./AssignRoleToUserCommand.js";

export class AssignRoleToUserCommandHandler implements ICommandHandler<AssignRoleToUserCommand, void> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  private async handle(input: AssignRoleToUserInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const role = await this.roleRepository.findById(input.roleId);

    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    const alreadyAssigned = await this.userRoleRepository.exists(
      input.userId,
      input.roleId,
    );

    if (alreadyAssigned) {
      throw new ConflictError("Role is already assigned to this user.");
    }

    await this.unitOfWork.execute(async (tx) => {
      await tx.userRoleRepository.assign(input.userId, input.roleId);

      const authorization = await this.buildAuthorizationSnapshot(
        tx,
        input.userId,
      );

      const messageId = randomUUID();
      const eventId = randomUUID();
      const occurredAt = new Date();

      await tx.outboxRepository.create({
        type: EVENT_TYPES.USER_ROLE_ASSIGNED,
        payload: {
          eventId,
          messageId,
          eventType: EVENT_TYPES.USER_ROLE_ASSIGNED,
          eventVersion: 1,

          aggregateId: input.userId,
          aggregateVersion: user.version,

          occurredAt: occurredAt.toISOString(),

          payload: {
            userId: input.userId,
            roleId: role.id,
            roleName: role.name,
            roles: authorization.roles,
            permissions: authorization.permissions,
          },
        },
      });
    });

    // Authorization data is now stale.
    await this.authorizationCache.invalidate(input.userId);
  }

  private async buildAuthorizationSnapshot(
    tx: ITransactionContext,
    userId: string,
  ): Promise<{ roles: string[]; permissions: string[] }> {
    const roleIds = await tx.userRoleRepository.findRolesByUserId(userId);

    const roleNames: string[] = [];

    const permissions = new Set<string>();

    for (const roleId of roleIds) {
      const role = await tx.roleRepository.findById(roleId);

      if (!role || role.isDeleted()) {
        continue;
      }

      roleNames.push(role.name);

      const rolePermissions =
        await tx.rolePermissionRepository.findPermissionsByRoleId(roleId);

      for (const permission of rolePermissions) {
        permissions.add(permission.name);
      }
    }

    return {
      roles: roleNames,
      permissions: [...permissions],
    };
  }

  async execute(command: AssignRoleToUserCommand): Promise<void> {
    return this.handle(command.input);
  }
}
