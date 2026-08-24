import type { ITrustedDeviceRepository } from "../../../../domain/repositories/ITrustedDeviceRepository.js";
import { createHash } from "node:crypto";

export interface CheckLoginDeviceResult {
  isNewDevice: boolean;
}

export class CheckLoginDeviceUseCase {
  constructor(
    private readonly trustedDeviceRepository: ITrustedDeviceRepository,
  ) {}

  generateDeviceId(ipAddress: string): string {
    return createHash("sha256").update(ipAddress).digest("hex");
  }

  async execute(
    userId: string,
    ipAddress: string,
  ): Promise<CheckLoginDeviceResult> {
    const deviceId = this.generateDeviceId(ipAddress);

    const trustedDevice = await this.trustedDeviceRepository.findActiveByUserAndDevice(
      userId,
      deviceId,
    );

    return {
      isNewDevice: trustedDevice === null,
    };
  }
}
