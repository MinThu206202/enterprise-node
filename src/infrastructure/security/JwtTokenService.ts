import { SignJWT, jwtVerify, type JWTPayload } from "jose";

import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  GeneratedRefreshToken,
  GeneratedPasswordResetToken,
  PasswordResetTokenPayload,
  ITokenService,
} from "../../application/ports/auth/ITokenService.js";

import { ConfigService } from "../config/ConfigService.js";

export class JwtTokenService implements ITokenService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;
  private readonly resetSecret: Uint8Array;

  constructor(private readonly config: ConfigService) {
    this.accessSecret = new TextEncoder().encode(this.config.jwtAccessSecret);

    this.refreshSecret = new TextEncoder().encode(this.config.jwtRefreshSecret);

    this.resetSecret = new TextEncoder().encode(this.config.jwtResetSecret);
  }

  async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    return new SignJWT({
      userId: payload.userId,
      type: "access",
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setIssuedAt()
      .setExpirationTime(this.config.jwtAccessExpiresIn)
      .sign(this.accessSecret);
  }

  async generateRefreshToken(
    payload: RefreshTokenPayload,
  ): Promise<GeneratedRefreshToken> {
    const token = await new SignJWT({
      userId: payload.userId,
      tokenId: payload.tokenId,
      type: "refresh",
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setIssuedAt()
      .setExpirationTime(this.config.jwtRefreshExpiresIn)
      .sign(this.refreshSecret);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return {
      token,
      tokenId: payload.tokenId,
      expiresAt,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, this.accessSecret, {
      algorithms: ["HS256"],
    });

    this.ensureTokenType(payload, "access");

    if (typeof payload.userId !== "string") {
      throw new Error("Invalid access token");
    }

    return {
      userId: payload.userId,
    };
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const { payload } = await jwtVerify(token, this.refreshSecret, {
      algorithms: ["HS256"],
    });

    this.ensureTokenType(payload, "refresh");

    if (
      typeof payload.userId !== "string" ||
      typeof payload.tokenId !== "string"
    ) {
      throw new Error("Invalid refresh token");
    }

    return {
      userId: payload.userId,
      tokenId: payload.tokenId,
    };
  }

  async verifyPasswordResetToken(
    token: string,
  ): Promise<PasswordResetTokenPayload> {
    const { payload } = await jwtVerify(token, this.resetSecret, {
      algorithms: ["HS256"],
    });

    this.ensureTokenType(payload, "password-reset");

    if (typeof payload.verificationId !== "string") {
      throw new Error("Invalid password reset token");
    }

    return {
      verificationId: payload.verificationId,
    };
  }

  async generatePasswordResetToken(
    payload: PasswordResetTokenPayload,
  ): Promise<GeneratedPasswordResetToken> {
    const token = await new SignJWT({
      verificationId: payload.verificationId,
      type: "password-reset",
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setIssuedAt()
      .setExpirationTime(this.config.jwtResetExpiresIn)
      .sign(this.resetSecret);

    const expiresAt = new Date(
      Date.now() + this.durationToSeconds(this.config.jwtResetExpiresIn) * 1000,
    );

    return {
      token,
      expiresAt,
    };
  }

  private ensureTokenType(
    payload: JWTPayload,
    expectedType: "access" | "refresh" | "password-reset",
  ): void {
    if (payload.type !== expectedType) {
      throw new Error("Invalid token type");
    }
  }

  private durationToSeconds(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);

    if (!match) {
      throw new Error(`Invalid duration format: ${value}`);
    }

    const amount = parseInt(match[1], 10);

    const unitMultipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return amount * unitMultipliers[match[2]];
  }
}
