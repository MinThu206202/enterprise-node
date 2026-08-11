interface RefreshTokenSessionProps {
  id: string;
  tokenId: string;
  userId: string;

  expiresAt: Date;

  revokedAt?: Date | null;
  replacedByTokenId?: string | null;

  deviceInfo?: string | null;
  ipAddress?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export class RefreshTokenSession {
  constructor(private readonly props: RefreshTokenSessionProps) {}

  getId(): string {
    return this.props.id;
  }

  getTokenId(): string {
    return this.props.tokenId;
  }

  getUserId(): string {
    return this.props.userId;
  }

  getExpiresAt(): Date {
    return this.props.expiresAt;
  }

  getRevokedAt(): Date | null {
    return this.props.revokedAt ?? null;
  }

  getReplacedByTokenId(): string | null {
    return this.props.replacedByTokenId ?? null;
  }

  getDeviceInfo(): string | null {
    return this.props.deviceInfo ?? null;
  }

  getIpAddress(): string | null {
    return this.props.ipAddress ?? null;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  isExpired(): boolean {
    return this.props.expiresAt <= new Date();
  }

  isRevoked(): boolean {
    return this.props.revokedAt !== null;
  }

  revoke(): void {
    this.props.revokedAt = new Date();
  }

  replaceWith(tokenId: string): void {
    this.props.replacedByTokenId = tokenId;
    this.props.revokedAt = new Date();
  }
}
