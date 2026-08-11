import { SignJWT, jwtVerify, type JWTPayload } from "jose";

import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  GeneratedRefreshToken,
  ITokenService,
} from "../../application/services/auth/ITokenService.js";

import { ConfigService } from "../config/ConfigService.js";

export class JwtTokenService implements ITokenService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;

  constructor(private readonly config: ConfigService) {
    this.accessSecret = new TextEncoder().encode(this.config.jwtAccessSecret);

    this.refreshSecret = new TextEncoder().encode(this.config.jwtRefreshSecret);
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

  private ensureTokenType(
    payload: JWTPayload,
    expectedType: "access" | "refresh",
  ): void {
    if (payload.type !== expectedType) {
      throw new Error("Invalid token type");
    }
  }
}
