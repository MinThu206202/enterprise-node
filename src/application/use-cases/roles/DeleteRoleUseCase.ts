import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";

export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<void> {
    // 1. Check whether role exists
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new Error("Role not found");
    }

    // 2. Delete role
    await this.roleRepository.delete(id);
  }
}
