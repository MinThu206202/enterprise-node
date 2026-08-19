import type { AuthorizationContext } from "../../context/AuthorizationContext.js";
import type { IAuthorizationRepository } from "../../../domain/repositories/IAuthorizationRepository.js";
import type { IAuthorizationService } from "./IAuthorizationService.js";

export class AuthorizationService implements IAuthorizationService {
  constructor(
    private readonly authorizationRepository: IAuthorizationRepository,
  ) {}

  async getUserAuthorization(userId: string): Promise<AuthorizationContext> {
    return this.authorizationRepository.getUserAuthorization(userId);
  }

  async hasRole(userId: string, requiredRoles: string[]): Promise<boolean> {
    const authorization =
      await this.authorizationRepository.getUserAuthorization(userId);

    return requiredRoles.some((requiredRole) =>
      authorization.roles.includes(requiredRole),
    );
  }

  async hasPermission(
    userId: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const authorization =
      await this.authorizationRepository.getUserAuthorization(userId);

    return requiredPermissions.every((requiredPermission) =>
      authorization.permissions.includes(requiredPermission),
    );
  }
}
