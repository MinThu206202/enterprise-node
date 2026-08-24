import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../../domain/repositories/IUserRoleRepository.js";
import type { UserRolesResponseDto } from "../dto/UserRolesResponseDto.js";
import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetUserRolesQuery } from "./GetUserRolesQuery.js";

export class GetUserRolesQueryHandler implements IQueryHandler<GetUserRolesQuery, UserRolesResponseDto[]> {
  constructor(
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  private async handle(userId: string): Promise<UserRolesResponseDto[]> {
    const roleIds = await this.userRoleRepository.findRolesByUserId(userId);

    const roles = await Promise.all(
      roleIds.map((roleId) => this.roleRepository.findById(roleId)),
    );

    return roles
      .filter((role) => role !== null)
      .map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      }));
  }

  async execute(command: GetUserRolesQuery): Promise<UserRolesResponseDto[]> {
    return this.handle(command.userId);
  }
}
