import type { AuthorizationContext } from "../../context/AuthorizationContext.js";
import type { IAuthorizationRepository } from "../../../domain/repositories/IAuthorizationRepository.js";
import type { IAuthorizationService } from "../../ports/authorization/IAuthorizationService.js";
import type { IAuthorizationCache } from "../../ports/authorization/IAuthorizationCache.js";

export class AuthorizationService implements IAuthorizationService {
  constructor(
    private readonly authorizationRepository: IAuthorizationRepository,
    private readonly authorizationCache: IAuthorizationCache,
  ) {}

  async getUserAuthorization(userId: string): Promise<AuthorizationContext> {
    const cachedAuthorization = await this.authorizationCache.get(userId);

    if (cachedAuthorization) {
      return cachedAuthorization;
    }

    const authorization =
      await this.authorizationRepository.getUserAuthorization(userId);

    await this.authorizationCache.set(userId, authorization);

    return authorization;
  }

  async hasRole(userId: string, requiredRoles: string[]): Promise<boolean> {
    const authorization = await this.getUserAuthorization(userId);

    return requiredRoles.some((requiredRole) =>
      authorization.roles.includes(requiredRole),
    );
  }

  async hasPermission(
    userId: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const authorization = await this.getUserAuthorization(userId);

    return requiredPermissions.every((requiredPermission) =>
      authorization.permissions.includes(requiredPermission),
    );
  }
}
