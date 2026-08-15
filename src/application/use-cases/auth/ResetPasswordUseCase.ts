import { randomUUID } from "node:crypto";

import type { ITokenService } from "../../services/auth/ITokenService.js";
import type { IPasswordResetStore } from "../../services/ password-reset/IPasswordResetStore.js";
import type { IPasswordHasher } from "../../services/auth/IPasswordHasher.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { ResetPasswordInput } from "../../dto/auth/ResetPasswordInput.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { VerificaionExpiredError } from "../../../shared/errors/VerificationExpiredError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export interface ResetPasswordResult {
  message: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly passwordResetStore: IPasswordResetStore,
    private readonly passwordHasher: IPasswordHasher,
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordResult> {
    const { verificationId } =
      await this.tokenService.verifyPasswordResetToken(input.resetToken);

    const lockId = randomUUID();

    const acquired = await this.passwordResetStore.acquireVerificationLock(
      verificationId,
      lockId,
      30,
    );

    if (!acquired) {
      throw new ConflictError("Password reset is already being processed");
    }

    try {
      const resetRequest = await this.passwordResetStore.get(verificationId);

      if (!resetRequest) {
        throw new VerificaionExpiredError();
      }

      const user = await this.userRepository.findById(resetRequest.userId);

      if (!user) {
        await this.passwordResetStore.delete(verificationId);

        throw new NotFoundError("No account found for this reset request");
      }

      const passwordHash = await this.passwordHasher.hash(input.newPassword);

      await this.userRepository.updatePassword(user.getId(), passwordHash);

      await this.passwordResetStore.delete(verificationId);

      this.logger.info("Password reset completed", {
        userId: user.getId(),
        email: user.getEmail(),
      });

      return {
        message: "Password has been updated",
      };
    } finally {
      await this.passwordResetStore.releaseVerificationLock(
        verificationId,
        lockId,
      );
    }
  }
}
