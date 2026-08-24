import type { User } from "../../domain/entities/User.js";
import type { AuthorizationContext } from "../context/AuthorizationContext.js";

import type { UserResponseDto } from "../modules/users/dto/UserResponseDto.js";

export class UserMapper {
  static toResponse(
    user: User,
    authorization?: AuthorizationContext,
  ): UserResponseDto {
    return {
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      ...(authorization
        ? {
            roles: authorization.roles,
            permissions: authorization.permissions,
          }
        : {}),
    };
  }
}
