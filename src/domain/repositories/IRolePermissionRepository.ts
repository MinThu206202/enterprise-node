import { Permission } from "../entities/Permission.js";

export interface IRolePermissionRepository {
  assign(roleId: string, permissionId: string): Promise<void>;

  remove(roleId: string, permissionId: string): Promise<void>;

  exists(roleId: string, permissionId: string): Promise<boolean>;

  findPermissionsByRoleId(roleId: string): Promise<Permission[]>;
}
