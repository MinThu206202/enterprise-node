export interface UserProps {
  id: string;
  email: string;
  name: string;
  version: number;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class User {
  constructor(private readonly props: UserProps) {}

  getId(): string {
    return this.props.id;
  }

  getEmail(): string {
    return this.props.email;
  }

  getName(): string {
    return this.props.name;
  }

  getPasswordHash(): string {
    return this.props.passwordHash;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.props.deletedAt;
  }

  getVersion(): number {
    return this.props.version;
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  get version(): number {
    return this.props.version;
  }
}
