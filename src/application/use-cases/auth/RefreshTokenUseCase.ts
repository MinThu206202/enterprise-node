import { randomUUID } from "node:crypto";

import { RefreshTokenSession } from "../../../domain/entities/RefreshTokenSession.js";

import type { IRefreshTokenSessionRepository } from "../../../domain/repositories/IRefreshTokenSessionRepository.js";

import type { ITokenService } from "../../services/auth/ITokenService.js";

import type { RefreshTokenInput } from "../../dto/auth/RefreshTokenInput.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly refreshTokenSessionRepository: IRefreshTokenSessionRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResult> {
    let payload;

    try {
      payload = await this.tokenService.verifyRefreshToken(input.refreshToken);
    } catch {
      this.logger.warn("Refresh token verification failed");

      throw new UnauthorizedError("Invalid refresh token");
    }

    const session = await this.refreshTokenSessionRepository.findByTokenId(
      payload.tokenId,
    );

    if (!session) {
      this.logger.warn("Refresh token session not found", {
        tokenId: payload.tokenId,
      });

      throw new UnauthorizedError("Invalid refresh token");
    }

    if (session.isExpired()) {
      this.logger.warn("Refresh token session expired", {
        tokenId: payload.tokenId,
        userId: session.getUserId(),
      });

      throw new UnauthorizedError("Refresh token expired");
    }

    if (session.isRevoked()) {
      this.logger.warn("Refresh token reuse detected", {
        tokenId: payload.tokenId,
        userId: session.getUserId(),
      });

      throw new UnauthorizedError("Refresh token has been revoked");
    }

    const newTokenId = randomUUID();

    const accessToken = await this.tokenService.generateAccessToken({
      userId: session.getUserId(),
    });

    const generatedRefreshToken = await this.tokenService.generateRefreshToken({
      userId: session.getUserId(),
      tokenId: newTokenId,
    });

    await this.refreshTokenSessionRepository.replace(
      session.getTokenId(),
      newTokenId,
    );

    const now = new Date();

    const newSession = new RefreshTokenSession({
      id: randomUUID(),

      tokenId: generatedRefreshToken.tokenId,

      userId: session.getUserId(),

      expiresAt: generatedRefreshToken.expiresAt,

      revokedAt: null,

      replacedByTokenId: null,

      deviceInfo: session.getDeviceInfo(),

      ipAddress: session.getIpAddress(),

      createdAt: now,

      updatedAt: now,
    });

    await this.refreshTokenSessionRepository.save(newSession);

    this.logger.info("Refresh token rotated successfully", {
      userId: session.getUserId(),
      oldTokenId: session.getTokenId(),
      newTokenId: generatedRefreshToken.tokenId,
    });

    return {
      accessToken,
      refreshToken: generatedRefreshToken.token,
    };
  }
}
