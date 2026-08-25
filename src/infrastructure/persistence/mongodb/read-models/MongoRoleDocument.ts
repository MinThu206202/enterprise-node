export interface MongoRoleDocument {
  _id: string;
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
