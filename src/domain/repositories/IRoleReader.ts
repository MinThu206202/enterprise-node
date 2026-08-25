import type { RoleReadModel } from "../../application/read-models/roles/RoleReadModel.js";

export interface IRoleReader {
  findById(id: string): Promise<RoleReadModel | null>;

  findAll(): Promise<RoleReadModel[]>;

  findByNames(names: string[]): Promise<RoleReadModel[]>;
}
