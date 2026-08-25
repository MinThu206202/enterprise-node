import type { PermissionReadModel } from "../../application/read-models/permissions/PermissionReadModel.js";

export interface IPermissionReader {
  findAll(): Promise<PermissionReadModel[]>;

  findByNames(names: string[]): Promise<PermissionReadModel[]>;
}
