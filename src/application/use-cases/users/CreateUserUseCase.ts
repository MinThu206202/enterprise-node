import { User } from "../../../domain/entities/User.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { CreateUserInput } from "../../dto/users/CreateUserInput.js";
import type { IPasswordHasher } from "../../services/auth/IPasswordHasher.js";


export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const now = new Date();

    const user = new User({
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    await this.userRepository.save(user);

    return user;
  }
}