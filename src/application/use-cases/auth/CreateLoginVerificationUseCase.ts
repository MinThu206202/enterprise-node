import { randomUUID } from "node:crypto";


import type { RequestContext } from "../../context/RequestContext.js";
import { IOtpService } from "../../services/registration/IOtpService.js";
import { IPendingLoginStore } from "../../../domain/repositories/IPendingLoginStore.js";
import { IEmailService } from "../../services/registration/IEmailService.js";

export interface CreateLoginVerificationResult {
  verificationId: string;
}

export class CreateLoginVerificationUseCase {
  constructor(
    private readonly otpService: IOtpService,
    private readonly pendingLoginStore: IPendingLoginStore,
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    userId: string,
    email: string,
    context: RequestContext,
  ): Promise<CreateLoginVerificationResult> {
    const verificationId = randomUUID();

    const otp = await this.otpService.generate();

    const otpHash = await this.otpService.hash(otp);

    await this.pendingLoginStore.create(
      verificationId,
      {
        userId,
        deviceInfo: context.deviceInfo ?? "unknown",
        ipAddress: context.ipAddress ?? "unknown",
        otpHash,
        attempts: 0,
      },
      600,
    );

    await this.emailService.sendNewDeviceLoginEmail({
      to: email,
      otp,
      deviceInfo: context.deviceInfo,
      ipAddress: context.ipAddress,
    });

    return {
      verificationId,
    };
  }
}
