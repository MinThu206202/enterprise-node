export interface MongoUserDocument {
  _id: string;
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
