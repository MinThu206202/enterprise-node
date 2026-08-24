import type { User } from "../entities/User.js";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  save(user: User): Promise<User>;

  updatePassword(id: string, passwordHash: string): Promise<void>;

  softDelete(id: string): Promise<void>;
}
