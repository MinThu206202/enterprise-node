import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";

export class GetCurrentUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(userId: string) {
    this.logger.info("Fetching current user", {
      userId,
    });

    const user = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn("Authenticated user not found", {
        userId,
      });

      throw new UnauthorizedError("User no longer exists");
    }

    return user;
  }
}
