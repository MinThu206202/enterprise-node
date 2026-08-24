export interface UserReadModel {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}