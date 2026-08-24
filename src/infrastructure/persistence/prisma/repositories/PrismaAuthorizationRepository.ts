import type { PrismaClient } from "../../../../generated/prisma/client.js";

import type { AuthorizationContext } from "../../../../application/context/AuthorizationContext.js";

import type { IAuthorizationRepository } from "../../../../domain/repositories/IAuthorizationRepository.js";

export class PrismaAuthorizationRepository implements IAuthorizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getUserAuthorization(userId: string): Promise<AuthorizationContext> {
    // Note: filtering the to-one `role` relation inside `include` is not
    // supported by the Prisma client, so we query from the Role side instead.
    const roles = await this.prisma.role.findMany({
      where: {
        deletedAt: null,

        userRoles: {
          some: {
            userId,
          },
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const roleNames = roles.map((role) => role.name);

    const permissions = roles.flatMap((role) =>
      role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    );

    return {
      userId,
      roles: [...new Set(roleNames)],
      permissions: [...new Set(permissions)],
    };
  }
}
