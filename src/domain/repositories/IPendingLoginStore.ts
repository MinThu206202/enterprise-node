export interface PendingLogin {
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  otpHash: string;
  attempts: number;
}

export interface IPendingLoginStore {
  create(
    verificationId: string,
    data: PendingLogin,
    ttlSeconds: number,
  ): Promise<void>;

  get(verificationId: string): Promise<PendingLogin | null>;

  incrementAttempts(verificationId: string): Promise<number>;

  delete(verificationId: string): Promise<void>;
}
