export interface IUserRoleRepository {
  create(userId: string, roleId: string): Promise<void>;
  findByUserId(userId: string): Promise<{ roleId: string }[]>;
}
