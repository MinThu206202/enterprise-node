import { randomUUID } from "node:crypto";

import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";

import type { IPasswordResetStore } from "../../../ports/password-reset/IPasswordResetStore.js";
import type { IOtpService } from "../../../ports/registration/IOtpService.js";
import type { IEmailJobQueue } from "../../../ports/queue/IEmailJobQueue.js";
import type { RequestForgotPasswordInput } from "../dto/RequestForgotPasswordInput.js";

import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import type { ILogger } from "../../../../shared/logging/ILogger.js";
import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { RequestForgotPasswordCommand } from "./RequestForgotPasswordCommand.js";

export interface RequestForgotPasswordResult {
  verificationId: string;
}

export class RequestForgotPasswordCommandHandler implements ICommandHandler<RequestForgotPasswordCommand, RequestForgotPasswordResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetStore: IPasswordResetStore,
    private readonly otpService: IOtpService,
    private readonly logger: ILogger,
    private readonly emailJobQueue: IEmailJobQueue,
  ) {}

  private async handle(
    input: RequestForgotPasswordInput,
  ): Promise<RequestForgotPasswordResult> {
    this.logger.info("Requesting password reset", {
      email: input.email,
    });

    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      this.logger.warn("Password reset failed: user not found", {
        email: input.email,
      });

      throw new NotFoundError("No account found with this email address");
    }

    const otp = this.otpService.generate();

    const otpHash = await this.otpService.hash(otp);

    const verificationId = randomUUID();

    await this.passwordResetStore.create(
      verificationId,
      {
        userId: user.getId(),
        email: user.getEmail(),
        name: user.getName(),
        otpHash,
        attempts: 0,
      },
      60 * 10,
    );

    await this.emailJobQueue.addPasswordResetEmail({
      verificationId,
      email: user.getEmail(),
      name: user.getName(),
      otp,
    });

    this.logger.info("Password reset request created", {
      verificationId,
      email: user.getEmail(),
    });

    return {
      verificationId,
    };
  }

  async execute(command: RequestForgotPasswordCommand): Promise<RequestForgotPasswordResult> {
    return this.handle(command.input);
  }
}
