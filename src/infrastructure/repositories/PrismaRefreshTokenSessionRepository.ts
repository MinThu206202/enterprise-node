import type { PrismaClient } from "../../generated/prisma/client.js";

import { RefreshTokenSession } from "../../domain/entities/RefreshTokenSession.js";

import type { IRefreshTokenSessionRepository } from "../../domain/repositories/IRefreshTokenSessionRepository.js";

export class PrismaRefreshTokenSessionRepository implements IRefreshTokenSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTokenId(tokenId: string): Promise<RefreshTokenSession | null> {
    const record = await this.prisma.refreshTokenSession.findUnique({
      where: {
        tokenId,
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async save(session: RefreshTokenSession): Promise<RefreshTokenSession> {
    const record = await this.prisma.refreshTokenSession.create({
      data: {
        id: session.getId(),
        tokenId: session.getTokenId(),
        userId: session.getUserId(),

        expiresAt: session.getExpiresAt(),

        revokedAt: session.getRevokedAt(),
        replacedByTokenId: session.getReplacedByTokenId(),

        deviceInfo: session.getDeviceInfo(),
        ipAddress: session.getIpAddress(),

        createdAt: session.getCreatedAt(),
        updatedAt: session.getUpdatedAt(),
      },
    });

    return this.toDomain(record);
  }

  async revoke(tokenId: string): Promise<void> {
    await this.prisma.refreshTokenSession.update({
      where: {
        tokenId,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  }

  async replace(tokenId: string, replacedByTokenId: string): Promise<void> {
    await this.prisma.refreshTokenSession.update({
      where: {
        tokenId,
      },

      data: {
        revokedAt: new Date(),
        replacedByTokenId,
      },
    });
  }

  private toDomain(record: {
    id: string;
    tokenId: string;
    userId: string;

    expiresAt: Date;

    revokedAt: Date | null;
    replacedByTokenId: string | null;

    deviceInfo: string | null;
    ipAddress: string | null;

    createdAt: Date;
    updatedAt: Date;
  }): RefreshTokenSession {
    return new RefreshTokenSession({
      id: record.id,
      tokenId: record.tokenId,
      userId: record.userId,

      expiresAt: record.expiresAt,

      revokedAt: record.revokedAt,
      replacedByTokenId: record.replacedByTokenId,

      deviceInfo: record.deviceInfo,
      ipAddress: record.ipAddress,

      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
