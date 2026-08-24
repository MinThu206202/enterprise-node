import type { IRefreshTokenSessionRepository } from "../../../domain/repositories/IRefreshTokenSessionRepository.js";

import type { ITokenService } from "../../services/auth/ITokenService.js";

import type { LogoutInput } from "../../dto/auth/LogoutInput.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";
import type { ICommandHandler } from "../../bus/ICommand.js";
import type { LogoutCommand } from "./LogoutCommand.js";

export class LogoutCommandHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly refreshTokenSessionRepository: IRefreshTokenSessionRepository,
    private readonly logger: ILogger,
  ) {}

  private async handle(input: LogoutInput): Promise<void> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(
        input.refreshToken,
      );

      const session = await this.refreshTokenSessionRepository.findByTokenId(
        payload.tokenId,
      );

      if (!session) {
        return;
      }

      if (session.isRevoked()) {
        return;
      }

      await this.refreshTokenSessionRepository.revoke(payload.tokenId);

      this.logger.info("User logged out successfully", {
        userId: session.getUserId(),
        tokenId: payload.tokenId,
      });
    } catch {
      // Logout should be idempotent.
      //
      // Even if the token is already invalid,
      // the client can consider itself logged out.

      this.logger.warn("Logout attempted with invalid refresh token");
    }
  }

  async execute(command: LogoutCommand): Promise<void> {
    return this.handle(command.input);
  }
}
