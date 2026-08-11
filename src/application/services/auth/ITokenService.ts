export interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export interface GeneratedRefreshToken {
  token: string;
  tokenId: string;
  expiresAt: Date;
}

export interface ITokenService {
  generateAccessToken(payload: AccessTokenPayload): Promise<string>;

  generateRefreshToken(
    payload: RefreshTokenPayload,
  ): Promise<GeneratedRefreshToken>;

  verifyAccessToken(token: string): Promise<AccessTokenPayload>;

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
}
