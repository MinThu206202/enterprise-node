export interface TrustedDeviceData {
  id: string;
  userId: string;
  deviceId: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
  trustedUntil: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITrustedDeviceRepository {
  findActiveByUserAndDevice(
    userId: string,
    deviceId: string,
  ): Promise<TrustedDeviceData | null>;

  save(device: TrustedDeviceData): Promise<TrustedDeviceData>;

  updateLastSeen(deviceId: string, userId: string): Promise<void>;
}
