import { CreateRoleInput } from "../../application/modules/roles/dto/CreateRoleInput.js";
import { UpdateRoleInput } from "../../application/modules/roles/dto/UpdateRoleInput.js";
import { Role } from "../entities/Role.js";

export interface IRoleRepository {
  create(data: CreateRoleInput): Promise<Role>;

  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(id: string, data: UpdateRoleInput): Promise<Role>;
  softDelete(id: string): Promise<void>;
}
