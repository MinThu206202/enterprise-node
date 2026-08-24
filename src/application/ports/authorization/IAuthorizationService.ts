import { AuthorizationContext } from "../../context/AuthorizationContext.js";

export interface IAuthorizationService {
  getUserAuthorization(userId: string): Promise<AuthorizationContext>;

  hasRole(userId: string, requiredRoles: string[]): Promise<boolean>;

  hasPermission(
    userId: string,
    requiredPermissions: string[],
  ): Promise<boolean>;
}
