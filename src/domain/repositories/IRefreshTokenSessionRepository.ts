import type { RefreshTokenSession } from "../entities/RefreshTokenSession.js";

export interface IRefreshTokenSessionRepository {
  findByTokenId(tokenId: string): Promise<RefreshTokenSession | null>;

  save(session: RefreshTokenSession): Promise<RefreshTokenSession>;

  revoke(tokenId: string): Promise<void>;

  replace(tokenId: string, replacedByTokenId: string): Promise<void>;

  hasKnownDevice(userId: string, deviceFingerprint: string): Promise<boolean>;

  hasKnownIp(userId: string, ipAddress: string): Promise<boolean>;
  hasDevice(userId: string, deviceInfo: string): Promise<boolean>;
}
