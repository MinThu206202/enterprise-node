import type { IPermissionRepository } from "../../../domain/repositories/IPermissionRepository.js";
import { permissionRegistry } from "./PermissionRegistry.js";

export class PermissionSynchronizer {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async synchronize(): Promise<void> {
    const permissionNames =
      permissionRegistry.getAllPermissionNames();

    for (const permissionName of permissionNames) {
      await this.permissionRepository.createIfNotExists(
        permissionName,
      );
    }
  }
}