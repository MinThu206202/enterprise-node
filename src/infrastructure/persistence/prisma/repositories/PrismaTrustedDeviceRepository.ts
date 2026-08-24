import type { PrismaClient } from "../../../../generated/prisma/client.js";
import type {
  ITrustedDeviceRepository,
  TrustedDeviceData,
} from "../../../../domain/repositories/ITrustedDeviceRepository.js";

export class PrismaTrustedDeviceRepository implements ITrustedDeviceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveByUserAndDevice(
    userId: string,
    deviceId: string,
  ): Promise<TrustedDeviceData | null> {
    const now = new Date();

    const record = await this.prisma.trustedDevice.findFirst({
      where: {
        userId,
        deviceId,
        revokedAt: null,
        trustedUntil: {
          gt: now,
        },
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      userId: record.userId,
      deviceId: record.deviceId,
      deviceInfo: record.deviceInfo,
      ipAddress: record.ipAddress,
      firstSeenAt: record.firstSeenAt,
      lastSeenAt: record.lastSeenAt,
      trustedUntil: record.trustedUntil,
      revokedAt: record.revokedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async save(device: TrustedDeviceData): Promise<TrustedDeviceData> {
    const record = await this.prisma.trustedDevice.upsert({
      where: {
        userId_deviceId: {
          userId: device.userId,
          deviceId: device.deviceId,
        },
      },
      create: {
        id: device.id,
        userId: device.userId,
        deviceId: device.deviceId,
        deviceInfo: device.deviceInfo,
        ipAddress: device.ipAddress,
        firstSeenAt: device.firstSeenAt,
        lastSeenAt: device.lastSeenAt,
        trustedUntil: device.trustedUntil,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt,
      },
      update: {
        lastSeenAt: device.lastSeenAt,
        deviceInfo: device.deviceInfo,
        ipAddress: device.ipAddress,
        trustedUntil: device.trustedUntil,
      },
    });

    return {
      id: record.id,
      userId: record.userId,
      deviceId: record.deviceId,
      deviceInfo: record.deviceInfo,
      ipAddress: record.ipAddress,
      firstSeenAt: record.firstSeenAt,
      lastSeenAt: record.lastSeenAt,
      trustedUntil: record.trustedUntil,
      revokedAt: record.revokedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async updateLastSeen(deviceId: string, userId: string): Promise<void> {
    await this.prisma.trustedDevice.updateMany({
      where: {
        userId,
        deviceId,
        revokedAt: null,
      },
      data: {
        lastSeenAt: new Date(),
      },
    });
  }
}
