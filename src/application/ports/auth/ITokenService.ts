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

export interface PasswordResetTokenPayload {
  verificationId: string;
}

export interface GeneratedPasswordResetToken {
  token: string;
  expiresAt: Date;
}

export interface ITokenService {
  generateAccessToken(payload: AccessTokenPayload): Promise<string>;

  generateRefreshToken(
    payload: RefreshTokenPayload,
  ): Promise<GeneratedRefreshToken>;

  verifyAccessToken(token: string): Promise<AccessTokenPayload>;

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;

  generatePasswordResetToken(
    payload: PasswordResetTokenPayload,
  ): Promise<GeneratedPasswordResetToken>;

  verifyPasswordResetToken(token: string): Promise<PasswordResetTokenPayload>;
}
