export interface PendingLogin {
  verificationId: string;
  userId: string;
  email: string;
  deviceInfo: string | null;
  ipAddress: string;
  expiresAt: Date;
}