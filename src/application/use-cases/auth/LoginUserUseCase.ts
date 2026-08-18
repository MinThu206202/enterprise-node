import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

import type { IRefreshTokenSessionRepository } from "../../../domain/repositories/IRefreshTokenSessionRepository.js";
import type { ITrustedDeviceRepository } from "../../../domain/repositories/ITrustedDeviceRepository.js";

import { RefreshTokenSession } from "../../../domain/entities/RefreshTokenSession.js";

import type { IPasswordHasher } from "../../services/auth/IPasswordHasher.js";
import type { ITokenService } from "../../services/auth/ITokenService.js";

import type { LoginUserInput } from "../../dto/auth/LoginUserInput.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";

import type { RequestContext } from "../../context/RequestContext.js";

import { randomUUID } from "node:crypto";

import { CheckLoginDeviceUseCase } from "./CheckLoginDeviceUseCase.js";
import { CreateLoginVerificationUseCase } from "./CreateLoginVerificationUseCase.js";

export type LoginUserResult =
  | {
      requiresVerification: false;
      accessToken: string;
      refreshToken: string;
    }
  | {
      requiresVerification: true;
      verificationId: string;
      message: string;
    };

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenSessionRepository: IRefreshTokenSessionRepository,
    private readonly trustedDeviceRepository: ITrustedDeviceRepository,
    private readonly logger: ILogger,
    private readonly checkLoginDeviceUseCase: CheckLoginDeviceUseCase,
    private readonly createLoginVerificationUseCase: CreateLoginVerificationUseCase,
  ) {}

  async execute(
    input: LoginUserInput,
    context: RequestContext,
  ): Promise<LoginUserResult> {
    this.logger.info("User login attempt", {
      email: input.email,
      ipAddress: context.ipAddress,
    });

    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      this.logger.warn("Login failed: invalid credentials", {
        email: input.email,
      });

      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordValid = await this.passwordHasher.verify(
      input.password,
      user.getPasswordHash(),
    );

    if (!passwordValid) {
      this.logger.warn("Login failed: invalid credentials", {
        userId: user.getId(),
      });

      throw new UnauthorizedError("Invalid email or password");
    }

    const deviceCheck = await this.checkLoginDeviceUseCase.execute(
      user.getId(),
      context.ipAddress ?? "unknown",
    );

    if (deviceCheck.isNewDevice) {
      const verification = await this.createLoginVerificationUseCase.execute(
        user.getId(),
        user.getEmail(),
        context,
      );

      this.logger.info("Login verification required for new device", {
        userId: user.getId(),
        verificationId: verification.verificationId,
        ipAddress: context.ipAddress,
      });

      return {
        requiresVerification: true,
        verificationId: verification.verificationId,
        message:
          "New device detected. A verification code has been sent to your email.",
      };
    }

    const accessToken = await this.tokenService.generateAccessToken({
      userId: user.getId(),
    });

    const tokenId = randomUUID();

    const generatedRefreshToken = await this.tokenService.generateRefreshToken({
      userId: user.getId(),
      tokenId,
    });

    const now = new Date();

    const session = new RefreshTokenSession({
      id: randomUUID(),

      tokenId: generatedRefreshToken.tokenId,

      userId: user.getId(),

      expiresAt: generatedRefreshToken.expiresAt,

      revokedAt: null,

      replacedByTokenId: null,

      deviceInfo: context.deviceInfo,

      ipAddress: context.ipAddress,

      createdAt: now,

      updatedAt: now,
    });

    await this.refreshTokenSessionRepository.save(session);

    const deviceId = this.checkLoginDeviceUseCase.generateDeviceId(
      context.ipAddress ?? "unknown",
    );
    await this.trustedDeviceRepository.updateLastSeen(deviceId, user.getId());

    this.logger.info("User logged in successfully", {
      userId: user.getId(),
      tokenId,
    });

    return {
      requiresVerification: false,
      accessToken,
      refreshToken: generatedRefreshToken.token,
    };
  }
}
