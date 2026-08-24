import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { DeleteRoleCommand } from "./DeleteRoleCommand.js";

import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../../ports/authorization/IAuthorizationCache.js";
import type { IUnitOfWork } from "../../../ports/database/IUnitOfWork.js";
import { EVENT_TYPES } from "../../../events/EventTypes.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { randomUUID } from "node:crypto";

export class DeleteRoleCommandHandler
  implements ICommandHandler<DeleteRoleCommand>
{
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    // 1. Check whether role exists
    const role = await this.roleRepository.findById(command.id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    await this.unitOfWork.execute(async (tx) => {
      // 2. Soft delete role
      await tx.roleRepository.softDelete(command.id);

      const messageId = randomUUID();
      const eventId = randomUUID();
      const occurredAt = new Date();

      await tx.outboxRepository.create({
        type: EVENT_TYPES.ROLE_DELETED,
        payload: {
          eventId,
          messageId,
          eventType: EVENT_TYPES.ROLE_DELETED,
          eventVersion: 1,

          aggregateId: role.id,
          aggregateVersion: role.version,

          occurredAt: occurredAt.toISOString(),

          payload: {
            roleId: role.id,
            version: role.version,
          },
        },
      });
    });

    // 3. Cached authorization data of users holding this role is now stale
    await this.invalidateAffectedUsers(command.id);
  }

  private async invalidateAffectedUsers(roleId: string): Promise<void> {
    const userIds =
      await this.userRoleRepository.findUserIdsByRoleId(roleId);

    await Promise.all(
      userIds.map((id) => this.authorizationCache.invalidate(id)),
    );
  }
}
