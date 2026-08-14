import type { IEmailService } from "../../application/services/registration/IEmailService.js";
import type { ILogger } from "../../shared/logging/ILogger.js";

export class LoggerEmailService implements IEmailService {
  constructor(private readonly logger: ILogger) {}

  async sendVerificationEmail(email: string, _otp: string): Promise<void> {
    // Intentionally avoid logging OTPs or hashes.
    this.logger.info("Verification email dispatch requested", { email });
  }
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    this.logger.info("Welcome email would be sent", {
      email,
      name,
    });
  }
}
