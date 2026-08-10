import { User } from "../../../domain/entities/User.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { CreateUserInput } from "../../dto/users/CreateUserInput.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(
    input: CreateUserInput,
  ): Promise<User> {
    this.logger.info("Creating user", {
      email: input.email,
    });

    const existingUser =
      await this.userRepository.findByEmail(
        input.email,
      );

    if (existingUser) {
      this.logger.warn("User already exists", {
        email: input.email,
      });

      throw new ConflictError(
        "User already exists",
      );
    }

    const user = new User({
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser =
      await this.userRepository.save(user);

    this.logger.info("User created", {
      userId: savedUser.getId(),
    });

    return savedUser;
  }
}