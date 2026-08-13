import { IOutboxRepository } from "../../../domain/repositories/IOutboxRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

export interface ITransactionContext{
    userRepository : IUserRepository,
    outboxRepository : IOutboxRepository
}