export interface IUserRoleRepository {
  assign(userId: string, roleId: string): Promise<void>;

  remove(userId: string, roleId: string): Promise<void>;

  exists(userId: string, roleId: string): Promise<boolean>;

  findRolesByUserId(userId: string): Promise<string[]>;
}