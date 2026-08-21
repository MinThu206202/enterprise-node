import type { AuthorizationContext } from "../../context/AuthorizationContext.js";
import type { IAuthorizationRepository } from "../../../domain/repositories/IAuthorizationRepository.js";
import type { IAuthorizationService } from "./IAuthorizationService.js";
import type { IAuthorizationCache } from "./IAuthorizationCache.js";

export class AuthorizationService implements IAuthorizationService {
  constructor(
    private readonly authorizationRepository: IAuthorizationRepository,
    private readonly authorizationCache: IAuthorizationCache,
  ) {}

  async getUserAuthorization(userId: string): Promise<AuthorizationContext> {
    const cachedAuthorization = await this.authorizationCache.get(userId);

    if (cachedAuthorization) {
      console.log(`[AUTH CACHE] HIT userId=${userId}`);

      return cachedAuthorization;
    }

    console.log(`[AUTH CACHE] MISS userId=${userId}`);

    const authorization =
      await this.authorizationRepository.getUserAuthorization(userId);

    await this.authorizationCache.set(userId, authorization);

    console.log(`[AUTH CACHE] SET userId=${userId}`);

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
