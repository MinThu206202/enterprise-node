import { IOutboxRepository } from "../../../domain/repositories/IOutboxRepository.js";
import { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";

export interface ITransactionContext{
    userRepository : IUserRepository,
    outboxRepository : IOutboxRepository,
    roleRepository : IRoleRepository,
    userRoleRepository : IUserRoleRepository
}