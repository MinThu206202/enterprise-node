import type { PrismaClient } from "../../generated/prisma/client.js";

import type { AuthorizationContext } from "../../application/context/AuthorizationContext.js";

import type { IAuthorizationRepository } from "../../domain/repositories/IAuthorizationRepository.js";

export class PrismaAuthorizationRepository implements IAuthorizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getUserAuthorization(userId: string): Promise<AuthorizationContext> {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const roles = userRoles.map((userRole) => userRole.role.name);

    const permissions = userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    );

    return {
      userId,
      roles: [...new Set(roles)],
      permissions: [...new Set(permissions)],
    };
  }
}
