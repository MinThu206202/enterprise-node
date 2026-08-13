import { randomInt } from "node:crypto";
import argon2 from "argon2";

import type { IOtpService } from "../../application/services/registration/IOtpService.js";

export class Argon2OtpService implements IOtpService {
  generate(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
  }

  async hash(otp: string): Promise<string> {
    return argon2.hash(otp);
  }

  async verify(otp: string, otpHash: string): Promise<boolean> {
    return argon2.verify(otpHash, otp);
  }
}
