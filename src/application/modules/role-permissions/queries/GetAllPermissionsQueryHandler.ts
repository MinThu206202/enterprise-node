import type { IPermissionRepository } from "../../../../domain/repositories/IPermissionRepository.js";
import type { RolePermissionResponseDto } from "../dto/RolePermissionResponseDto.js";
import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetAllPermissionsQuery } from "./GetAllPermissionsQuery.js";

export class GetAllPermissionsQueryHandler implements IQueryHandler<GetAllPermissionsQuery, RolePermissionResponseDto[]> {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  private async handle(): Promise<RolePermissionResponseDto[]> {
    const permissions = await this.permissionRepository.findAll();

    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    }));
  }

  async execute(_command: GetAllPermissionsQuery): Promise<RolePermissionResponseDto[]> {
    return this.handle();
  }
}
