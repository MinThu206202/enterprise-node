import type { IUserReader } from "../../../domain/repositories/IUserReader.js";

import type { UserResponseDto } from "../../dto/users/UserResponseDto.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";

import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import type { IQueryHandler } from "../../bus/IQuery.js";
import type { GetUserByIdQuery } from "./GetUserByIdQuery.js";

export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, UserResponseDto> {
  constructor(
    private readonly userReader: IUserReader,
    private readonly logger: ILogger,
  ) {}

  private async handle(userId: string): Promise<UserResponseDto> {
    this.logger.info("Fetching user by id", {
      userId,
    });

    const user = await this.userReader.findById(userId);

    if (!user) {
      this.logger.warn("User not found", {
        userId,
      });

      throw new NotFoundError("User not found");
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

  async execute(command: GetUserByIdQuery): Promise<UserResponseDto> {
    return this.handle(command.userId);
  }
}
