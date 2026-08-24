import type { UserReadModel } from "../../application/read-models/users/UserReadModel.js";

export interface IUserReader {
  findById(id: string): Promise<UserReadModel | null>;

  findAll(): Promise<UserReadModel[]>;
}
