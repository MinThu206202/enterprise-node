import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { UpdateRoleCommand } from "./UpdateRoleCommand.js";

import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../../ports/authorization/IAuthorizationCache.js";
import type { IUnitOfWork } from "../../../ports/database/IUnitOfWork.js";
import { EVENT_TYPES } from "../../../events/EventTypes.js";
import type { RoleResponseDto } from "../dto/RoleResponseDto.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { ConflictError } from "../../../../shared/errors/ConflictError.js";
import { randomUUID } from "node:crypto";

export class UpdateRoleCommandHandler
  implements ICommandHandler<UpdateRoleCommand, RoleResponseDto>
{
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(command.id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    if (command.input.name && command.input.name !== role.name) {
      const existingRole = await this.roleRepository.findByName(
        command.input.name,
      );

      if (existingRole && existingRole.id !== command.id) {
        throw new ConflictError("Role name already exists");
      }
    }

    const updatedRole = await this.unitOfWork.execute(async (tx) => {
      const updated = await tx.roleRepository.update(command.id, command.input);

      const messageId = randomUUID();
      const eventId = randomUUID();
      const occurredAt = new Date();

      await tx.outboxRepository.create({
        type: EVENT_TYPES.ROLE_UPDATED,
        payload: {
          eventId,
          messageId,
          eventType: EVENT_TYPES.ROLE_UPDATED,
          eventVersion: 1,

          aggregateId: updated.id,
          aggregateVersion: updated.version,

          occurredAt: occurredAt.toISOString(),

          payload: {
            roleId: updated.id,
            name: updated.name,
            description: updated.description ?? "",
            version: updated.version,
          },
        },
      });

      return updated;
    });

    // Cached authorization data (roles list) of users holding this role is now stale
    await this.invalidateAffectedUsers(command.id);

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      createdAt: updatedRole.createdAt,
      updatedAt: updatedRole.updatedAt,
    };
  }

  private async invalidateAffectedUsers(roleId: string): Promise<void> {
    const userIds =
      await this.userRoleRepository.findUserIdsByRoleId(roleId);

    await Promise.all(
      userIds.map((userId) => this.authorizationCache.invalidate(userId)),
    );
  }
}
