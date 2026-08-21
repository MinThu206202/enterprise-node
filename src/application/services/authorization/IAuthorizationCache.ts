import type { AuthorizationContext } from "../../context/AuthorizationContext.js";

export interface IAuthorizationCache {
  get(userId: string): Promise<AuthorizationContext | null>;

  set(userId: string, authorization: AuthorizationContext): Promise<void>;

  invalidate(userId: string): Promise<void>;
}
