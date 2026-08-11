export interface UserProps {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
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
}
