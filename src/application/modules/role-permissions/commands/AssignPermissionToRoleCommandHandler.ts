import { IRolePermissionRepository } from "../../../../domain/repositories/IRolePermissionRepository.js";
import type { IUserRoleRepository } from "../../../../domain/repositories/IUserRoleRepository.js";
import type { IPermissionRepository } from "../../../../domain/repositories/IPermissionRepository.js";
import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { IAuthorizationCache } from "../../../ports/authorization/IAuthorizationCache.js";
import type { IUnitOfWork } from "../../../ports/database/IUnitOfWork.js";
import { EVENT_TYPES } from "../../../events/EventTypes.js";
import { ConflictError } from "../../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { AssignPermissionToRoleInput } from "../dto/AssignPermissionToRoleInput.js";
import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { AssignPermissionToRoleCommand } from "./AssignPermissionToRoleCommand.js";
import { randomUUID } from "node:crypto";

export class AssignPermissionToRoleCommandHandler implements ICommandHandler<AssignPermissionToRoleCommand, void> {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
    private readonly permissionRepository: IPermissionRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  private async handle(input: AssignPermissionToRoleInput): Promise<void> {
    const role = await this.roleRepository.findById(input.roleId);

    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    const permission = await this.permissionRepository.findById(
      input.permissionId,
    );

    if (!permission) {
      throw new NotFoundError("Permission not found.");
    }

    const alreadyExists = await this.rolePermissionRepository.exists(
      input.roleId,
      input.permissionId,
    );

    if (alreadyExists) {
      throw new ConflictError("Permission is already assigned to this role.");
    }

    await this.unitOfWork.execute(async (tx) => {
      await tx.rolePermissionRepository.assign(
        input.roleId,
        input.permissionId,
      );

      const messageId = randomUUID();
      const eventId = randomUUID();
      const occurredAt = new Date();

      await tx.outboxRepository.create({
        type: EVENT_TYPES.ROLE_PERMISSION_ASSIGNED,
        payload: {
          eventId,
          messageId,
          eventType: EVENT_TYPES.ROLE_PERMISSION_ASSIGNED,
          eventVersion: 1,

          aggregateId: input.roleId,
          aggregateVersion: role.version,

          occurredAt: occurredAt.toISOString(),

          payload: {
            roleId: input.roleId,
            permissionId: permission.id,
            permissionCode: permission.name,
          },
        },
      });
    });

    await this.invalidateAffectedUsers(input.roleId);
  }

  private async invalidateAffectedUsers(roleId: string): Promise<void> {
    const userIds = await this.userRoleRepository.findUserIdsByRoleId(roleId);

    await Promise.all(userIds.map((id) => this.authorizationCache.invalidate(id)));
  }

  async execute(command: AssignPermissionToRoleCommand): Promise<void> {
    return this.handle(command.input);
  }
}
