import type { ITokenService } from "../../services/auth/ITokenService.js";
import type { IOtpService } from "../../services/registration/IOtpService.js";
import type { IPendingLoginStore } from "../../../domain/repositories/IPendingLoginStore.js";

import type { IRefreshTokenSessionRepository } from "../../../domain/repositories/IRefreshTokenSessionRepository.js";
import type { ITrustedDeviceRepository } from "../../../domain/repositories/ITrustedDeviceRepository.js";

import { RefreshTokenSession } from "../../../domain/entities/RefreshTokenSession.js";

import type { VerifyLoginOtpInput } from "../../dto/auth/VerifyLoginOtpInput.js";
import type { VerifyLoginOtpResult } from "../../dto/auth/VerifyLoginOtpResult.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";

import { randomUUID } from "node:crypto";
import { CheckLoginDeviceUseCase } from "./CheckLoginDeviceUseCase.js";

const TRUST_DAYS = 30;

export class VerifyLoginOtpUseCase {
  constructor(
    private readonly pendingLoginStore: IPendingLoginStore,
    private readonly otpService: IOtpService,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenSessionRepository: IRefreshTokenSessionRepository,
    private readonly trustedDeviceRepository: ITrustedDeviceRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(input: VerifyLoginOtpInput): Promise<VerifyLoginOtpResult> {
    const pendingLogin = await this.pendingLoginStore.get(input.verificationId);

    if (!pendingLogin) {
      throw new UnauthorizedError(
        "Login verification has expired or is invalid.",
      );
    }

    const otpValid = await this.otpService.verify(
      input.otp,
      pendingLogin.otpHash,
    );

    if (!otpValid) {
      this.logger.warn("Login OTP verification failed", {
        verificationId: input.verificationId,
        userId: pendingLogin.userId,
      });

      throw new UnauthorizedError("Invalid or expired verification code.");
    }

    const accessToken = await this.tokenService.generateAccessToken({
      userId: pendingLogin.userId,
    });

    const tokenId = randomUUID();

    const generatedRefreshToken = await this.tokenService.generateRefreshToken({
      userId: pendingLogin.userId,
      tokenId,
    });

    const now = new Date();

    const session = new RefreshTokenSession({
      id: randomUUID(),

      tokenId: generatedRefreshToken.tokenId,

      userId: pendingLogin.userId,

      expiresAt: generatedRefreshToken.expiresAt,

      revokedAt: null,

      replacedByTokenId: null,

      deviceInfo: pendingLogin.deviceInfo,

      ipAddress: pendingLogin.ipAddress,

      createdAt: now,

      updatedAt: now,
    });

    await this.refreshTokenSessionRepository.save(session);

    const checkLoginDevice = new CheckLoginDeviceUseCase(this.trustedDeviceRepository);
    const deviceId = checkLoginDevice.generateDeviceId(pendingLogin.ipAddress);

    const trustedUntil = new Date(now.getTime() + TRUST_DAYS * 24 * 60 * 60 * 1000);

    await this.trustedDeviceRepository.save({
      id: randomUUID(),
      userId: pendingLogin.userId,
      deviceId,
      deviceInfo: pendingLogin.deviceInfo,
      ipAddress: pendingLogin.ipAddress,
      firstSeenAt: now,
      lastSeenAt: now,
      trustedUntil,
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await this.pendingLoginStore.delete(input.verificationId);

    this.logger.info("New device login verified successfully", {
      userId: pendingLogin.userId,
      tokenId,
    });

    return {
      accessToken,
      refreshToken: generatedRefreshToken.token,
    };
  }
}
