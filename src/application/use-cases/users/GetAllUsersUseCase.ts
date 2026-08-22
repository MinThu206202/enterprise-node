import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

import type { UserResponseDto } from "../../dto/users/UserResponseDto.js";
import { UserMapper } from "../../mappers/UserMapper.js";

import type { IAuthorizationService } from "../../services/authorization/IAuthorizationService.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";

export class GetAllUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<UserResponseDto[]> {
    this.logger.info("Fetching all users");

    const users = await this.userRepository.findAll();

    return Promise.all(
      users.map(async (user) => {
        const authorization =
          await this.authorizationService.getUserAuthorization(user.getId());

        return UserMapper.toResponse(user, authorization);
      }),
    );
  }
}
