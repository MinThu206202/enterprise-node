export interface MongoPermissionDocument {
  _id: string;
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
