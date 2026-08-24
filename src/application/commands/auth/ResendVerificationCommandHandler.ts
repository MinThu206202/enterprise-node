import type { IRegistrationStore } from "../../services/registration/IRegistrationStore.js";
import type { IOtpService } from "../../services/registration/IOtpService.js";
import type { IEmailService } from "../../services/registration/IEmailService.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";

import type { ResendVerificationInput } from "../../validation/auth/resendVerificationSchema.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import type { ICommandHandler } from "../../bus/ICommand.js";
import type { ResendVerificationCommand } from "./ResendVerificationCommand.js";

export interface ResendVerificationResult {
  verificationId: string;
  message : string;
}

export class ResendVerificationCommandHandler implements ICommandHandler<ResendVerificationCommand, ResendVerificationResult> {
  constructor(
    private readonly registrationStore: IRegistrationStore,
    private readonly otpService: IOtpService,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {}

  private async handle(
    input: ResendVerificationInput,
  ): Promise<ResendVerificationResult> {
    const registration = await this.registrationStore.get(input.verificationId);

    if (!registration) {
      throw new UnauthorizedError("Verification request is invalid or expired");
    }

    const otp = this.otpService.generate();

    const otpHash = await this.otpService.hash(otp);

    const updateRegistration = {
      ...registration,
      otpHash,
      attempts: 0,
    };

    await this.registrationStore.update(
      input.verificationId,
      updateRegistration,
      600,
    );

    await this.emailService.sendVerificationEmail(registration.email, otp ,registration.name);

    this.logger.info("Verification OTP send", {
      verificationId: input.verificationId,
      email: registration.email,
    });

    return {
      verificationId: input.verificationId,
      message: "Verification code has been sent",
    };
  }

  async execute(command: ResendVerificationCommand): Promise<ResendVerificationResult> {
    return this.handle(command.input);
  }
}
