export interface IEmailService {
  sendVerificationEmail(
    email: string,
    otp: string,
    name: string,
  ): Promise<void>;

  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendPasswordResetEmail(
    email: string,
    otp: string,
    name: string,
  ): Promise<void>;
  sendNewDeviceLoginEmail(params: {
    to: string;
    otp: string;
    deviceInfo: string | null;
    ipAddress: string | null;
  }): Promise<void>;
}
