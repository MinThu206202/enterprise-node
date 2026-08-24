import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { CreateRoleCommand } from "./CreateRoleCommand.js";

import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { IUnitOfWork } from "../../../ports/database/IUnitOfWork.js";
import { EVENT_TYPES } from "../../../events/EventTypes.js";
import type { RoleResponseDto } from "../dto/RoleResponseDto.js";
import { ConflictError } from "../../../../shared/errors/ConflictError.js";
import { randomUUID } from "node:crypto";

export class CreateRoleCommandHandler
  implements ICommandHandler<CreateRoleCommand, RoleResponseDto>
{
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: CreateRoleCommand): Promise<RoleResponseDto> {
    const existingRole = await this.roleRepository.findByName(
      command.input.name,
    );

    if (existingRole) {
      throw new ConflictError("Role already exists");
    }

    const createdRole = await this.unitOfWork.execute(async (tx) => {
      const role = await tx.roleRepository.create(command.input);

      const messageId = randomUUID();
      const eventId = randomUUID();
      const occurredAt = new Date();

      await tx.outboxRepository.create({
        type: EVENT_TYPES.ROLE_CREATED,
        payload: {
          eventId,
          messageId,
          eventType: EVENT_TYPES.ROLE_CREATED,
          eventVersion: 1,

          aggregateId: role.id,
          aggregateVersion: role.version,

          occurredAt: occurredAt.toISOString(),

          payload: {
            roleId: role.id,
            name: role.name,
            description: role.description ?? "",
            version: role.version,
          },
        },
      });

      return role;
    });

    return {
      id: createdRole.id,
      name: createdRole.name,
      description: createdRole.description,
      createdAt: createdRole.createdAt,
      updatedAt: createdRole.updatedAt,
    };
  }
}
