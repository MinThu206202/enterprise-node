import type { FastifyReply, FastifyRequest } from "fastify";

import { RegisterUserCommand } from "../../../src/application/modules/auth/commands/RegisterUserCommand.js";
import { GetCurrentUserQuery } from "../../../src/application/modules/users/queries/GetCurrentUserQuery.js";
import { GetAllUsersQuery } from "../../../src/application/modules/users/queries/GetAllUsersQuery.js";
import { GetUserByIdQuery } from "../../../src/application/modules/users/queries/GetUserByIdQuery.js";
import type { CommandBus } from "../../../src/application/bus/CommandBus.js";
import type { QueryBus } from "../../../src/application/bus/QueryBus.js";

import { createUserSchema } from "../../../src/application/modules/users/validation/createUserSchema.js";



import { ValidationError } from "../../../src/shared/errors/ValidationError.js";

export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const result = createUserSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const registration = await this.commandBus.execute(new RegisterUserCommand(result.data));

    return reply.status(201).send({
      verificationId: registration.verificationId,
    });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.queryBus.execute(new GetCurrentUserQuery(request.userId!));

    return reply.status(200).send(user);
  }

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const users = await this.queryBus.execute(new GetAllUsersQuery());

    return reply.status(200).send(users);
  }

  async getById(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const user = await this.queryBus.execute(new GetUserByIdQuery(request.params.id));

    return reply.status(200).send(user);
  }
}
