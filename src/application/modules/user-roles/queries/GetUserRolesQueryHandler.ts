import type { IUserReader } from "../../../../domain/repositories/IUserReader.js";
import type { IRoleReader } from "../../../../domain/repositories/IRoleReader.js";
import type { UserRolesResponseDto } from "../dto/UserRolesResponseDto.js";
import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetUserRolesQuery } from "./GetUserRolesQuery.js";

export class GetUserRolesQueryHandler implements IQueryHandler<GetUserRolesQuery, UserRolesResponseDto[]> {
  constructor(
    private readonly userReader: IUserReader,
    private readonly roleReader: IRoleReader,
  ) {}

  async execute(command: GetUserRolesQuery): Promise<UserRolesResponseDto[]> {
    const user = await this.userReader.findById(command.userId);

    if (!user || user.roles.length === 0) {
      return [];
    }

    const roles = await this.roleReader.findByNames(user.roles);

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
    }));
  }
}
