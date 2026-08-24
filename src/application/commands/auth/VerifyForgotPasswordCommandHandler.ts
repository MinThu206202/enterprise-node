import { randomUUID } from "node:crypto";

import type { IPasswordResetStore } from "../../services/password-reset/IPasswordResetStore.js";
import type { IOtpService } from "../../services/registration/IOtpService.js";
import type { ITokenService } from "../../services/auth/ITokenService.js";
import type { VerifyForgotPasswordInput } from "../../dto/auth/VerifyForgotPasswordInput.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { VerificaionExpiredError } from "../../../shared/errors/VerificationExpiredError.js";
import { TooManyVerificationAttemptsError } from "../../../shared/errors/TooManyVerificationAttemptsError.js";
import { InvalidVerificationCodeError } from "../../../shared/errors/InvalidVerificationCodeError.js";
import type { ICommandHandler } from "../../bus/ICommand.js";
import type { VerifyForgotPasswordCommand } from "./VerifyForgotPasswordCommand.js";

export interface VerifyForgotPasswordResult {
  resetToken: string;
  expiresAt: Date;
}

const MAX_ATTEMPTS = 5;

export class VerifyForgotPasswordCommandHandler implements ICommandHandler<VerifyForgotPasswordCommand, VerifyForgotPasswordResult> {
  constructor(
    private readonly passwordResetStore: IPasswordResetStore,
    private readonly otpService: IOtpService,
    private readonly tokenService: ITokenService,
    private readonly logger: ILogger,
  ) {}

  private async handle(
    input: VerifyForgotPasswordInput,
  ): Promise<VerifyForgotPasswordResult> {
    const lockId = randomUUID();

    const acquired = await this.passwordResetStore.acquireVerificationLock(
      input.verificationId,
      lockId,
      30,
    );

    if (!acquired) {
      throw new ConflictError("Password reset is already being processed");
    }

    try {
      const resetRequest = await this.passwordResetStore.get(
        input.verificationId,
      );

      if (!resetRequest) {
        throw new VerificaionExpiredError();
      }

      if (resetRequest.attempts >= MAX_ATTEMPTS) {
        throw new TooManyVerificationAttemptsError();
      }

      const valid = await this.otpService.verify(
        input.otp,
        resetRequest.otpHash,
      );

      if (!valid) {
        await this.passwordResetStore.incrementAttempts(input.verificationId);

        throw new InvalidVerificationCodeError();
      }

      const { token, expiresAt } =
        await this.tokenService.generatePasswordResetToken({
          verificationId: input.verificationId,
        });

      this.logger.info("Password reset OTP verified", {
        verificationId: input.verificationId,
        email: resetRequest.email,
      });

      return {
        resetToken: token,
        expiresAt,
      };
    } finally {
      await this.passwordResetStore.releaseVerificationLock(
        input.verificationId,
        lockId,
      );
    }
  }

  async execute(command: VerifyForgotPasswordCommand): Promise<VerifyForgotPasswordResult> {
    return this.handle(command.input);
  }
}
