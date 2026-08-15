import type { IPasswordResetStore } from "../../services/ password-reset/IPasswordResetStore.js";
import type { IOtpService } from "../../services/registration/IOtpService.js";
import type { IEmailJobQueue } from "../../services/queue/IEmailJobQueue.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";

import type { ResendForgotPasswordInput } from "../../dto/auth/ResendForgotPasswordInput.js";

import { VerificaionExpiredError } from "../../../shared/errors/VerificationExpiredError.js";

export interface ResendForgotPasswordResult {
  verificationId: string;
  message: string;
}

export class ResendForgotPasswordUseCase {
  constructor(
    private readonly passwordResetStore: IPasswordResetStore,
    private readonly otpService: IOtpService,
    private readonly emailJobQueue: IEmailJobQueue,
    private readonly logger: ILogger,
  ) {}

  async execute(
    input: ResendForgotPasswordInput,
  ): Promise<ResendForgotPasswordResult> {
    const resetRequest = await this.passwordResetStore.get(
      input.verificationId,
    );

    if (!resetRequest) {
      throw new VerificaionExpiredError();
    }

    const otp = this.otpService.generate();

    const otpHash = await this.otpService.hash(otp);

    await this.passwordResetStore.update(
      input.verificationId,
      {
        ...resetRequest,
        otpHash,
        attempts: 0,
      },
      60 * 10,
    );

    await this.emailJobQueue.addPasswordResetEmail({
      verificationId: input.verificationId,
      email: resetRequest.email,
      name: resetRequest.name,
      otp,
    });

    this.logger.info("Password reset OTP resent", {
      verificationId: input.verificationId,
      email: resetRequest.email,
    });

    return {
      verificationId: input.verificationId,
      message: "Reset code has been sent",
    };
  }
}
