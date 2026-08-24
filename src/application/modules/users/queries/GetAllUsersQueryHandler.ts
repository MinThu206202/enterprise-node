import type { IUserReader } from "../../../../domain/repositories/IUserReader.js";
import type { UserResponseDto } from "../dto/UserResponseDto.js";
import type { ILogger } from "../../../../shared/logging/ILogger.js";
import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetAllUsersQuery } from "./GetAllUsersQuery.js";

export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery, UserResponseDto[]> {
  constructor(
    private readonly userReader: IUserReader,
    private readonly logger: ILogger,
  ) {}

  private async handle(): Promise<UserResponseDto[]> {
    this.logger.info("Fetching all users");

    const users = await this.userReader.findAll();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async execute(_command: GetAllUsersQuery): Promise<UserResponseDto[]> {
    return this.handle();
  }
}
