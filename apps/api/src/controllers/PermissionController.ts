import type { FastifyReply, FastifyRequest } from "fastify";

import type { IPermissionRepository } from "../../../../src/domain/repositories/IPermissionRepository.js";

export class PermissionController {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const permissions = await this.permissionRepository.findAll();

    return reply.status(200).send(
      permissions.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
      })),
    );
  }
}
