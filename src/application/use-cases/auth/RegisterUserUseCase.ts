import { randomUUID } from "node:crypto";

import { User } from "../../../domain/entities/User.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

import type { IPasswordHasher } from "../../services/auth/IPasswordHasher.js";
import type { RegisterUserInput } from "../../dto/auth/RegisterUserInput.js";

import { ConflictError } from "../../../shared/errors/ConflictError.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly logger: ILogger,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    this.logger.info("Registering user", {
      email: input.email,
    });

    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      this.logger.warn("Registration failed: user already exists", {
        email: input.email,
      });

      throw new ConflictError("User already exists");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = new User({
      id: randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    this.logger.info("User registered successfully", {
      userId: savedUser.getId(),
    });

    return savedUser;
  }
}
