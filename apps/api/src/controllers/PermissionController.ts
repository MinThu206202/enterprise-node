import type { FastifyReply, FastifyRequest } from "fastify";

import { GetAllPermissionsQuery } from "../../../../src/application/queries/rolePermissions/GetAllPermissionsQuery.js";
import type { QueryBus } from "../../../../src/application/bus/QueryBus.js";


export class PermissionController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const permissions = await this.queryBus.execute(new GetAllPermissionsQuery());

    return reply.status(200).send(permissions);
  }
}
