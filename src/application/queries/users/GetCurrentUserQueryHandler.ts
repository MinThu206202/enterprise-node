import type { IUserReader } from "../../../domain/repositories/IUserReader.js";

import type { UserResponseDto } from "../../dto/users/UserResponseDto.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import type { IQueryHandler } from "../../bus/IQuery.js";
import type { GetCurrentUserQuery } from "./GetCurrentUserQuery.js";

export class GetCurrentUserQueryHandler implements IQueryHandler<GetCurrentUserQuery, UserResponseDto> {
  constructor(
    private readonly userReader: IUserReader,
    private readonly logger: ILogger,
  ) {}

  private async handle(userId: string): Promise<UserResponseDto> {
    this.logger.info("Fetching current user", {
      userId,
    });

    const user = await this.userReader.findById(userId);

    if (!user) {
      this.logger.warn("Authenticated user not found", {
        userId,
      });

      throw new UnauthorizedError("User no longer exists");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async execute(command: GetCurrentUserQuery): Promise<UserResponseDto> {
    return this.handle(command.userId);
  }
}
