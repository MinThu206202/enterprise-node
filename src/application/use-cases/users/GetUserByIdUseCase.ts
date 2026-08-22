import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

import type { UserResponseDto } from "../../dto/users/UserResponseDto.js";
import { UserMapper } from "../../mappers/UserMapper.js";

import type { IAuthorizationService } from "../../services/authorization/IAuthorizationService.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class GetUserByIdUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly logger: ILogger,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    this.logger.info("Fetching user by id", {
      userId,
    });

    const [user, authorization] = await Promise.all([
      this.userRepository.findById(userId),
      this.authorizationService.getUserAuthorization(userId),
    ]);

    if (!user) {
      this.logger.warn("User not found", {
        userId,
      });

      throw new NotFoundError("User not found");
    }

    return UserMapper.toResponse(user, authorization);
  }
}
