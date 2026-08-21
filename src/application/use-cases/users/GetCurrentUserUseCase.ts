import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";
import type { IAuthorizationService } from "../../services/authorization/IAuthorizationService.js";
import type { AuthorizationContext } from "../../context/AuthorizationContext.js";
import type { User } from "../../../domain/entities/User.js";

export interface CurrentUserResult {
  user: User;
  authorization: AuthorizationContext;
}

export class GetCurrentUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly logger: ILogger,
  ) {}

  async execute(userId: string): Promise<CurrentUserResult> {
    this.logger.info("Fetching current user", {
      userId,
    });

    const [user, authorization] = await Promise.all([
      this.userRepository.findById(userId),
      this.authorizationService.getUserAuthorization(userId),
    ]);

    if (!user) {
      this.logger.warn("Authenticated user not found", {
        userId,
      });

      throw new UnauthorizedError("User no longer exists");
    }

    return { user, authorization };
  }
}
