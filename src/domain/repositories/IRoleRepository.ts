import { CreateRoleInput } from "../../application/dto/roles/CreateRoleInput.js";
import { UpdateRoleInput } from "../../application/dto/roles/UpdateRoleInput.js";
import { Role } from "../entities/Role.js";

export interface IRoleRepository {
  create(data: CreateRoleInput): Promise<Role>;

  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(id: string, data: UpdateRoleInput): Promise<Role>;
  delete(id: string): Promise<void>;
}
