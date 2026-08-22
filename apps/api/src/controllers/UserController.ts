import type { FastifyReply, FastifyRequest } from "fastify";

import { createUserSchema } from "../../../../src/application/validation/users/createUserSchema.js";

import type { RegisterUserUseCase } from "../../../../src/application/use-cases/auth/RegisterUserUseCase.js";

import type { GetCurrentUserUseCase } from "../../../../src/application/use-cases/users/GetCurrentUserUseCase.js";
import type { GetAllUsersUseCase } from "../../../../src/application/use-cases/users/GetAllUsersUseCase.js";
import type { GetUserByIdUseCase } from "../../../../src/application/use-cases/users/GetUserByIdUseCase.js";

import { ValidationError } from "../../../../src/shared/errors/ValidationError.js";
import { UserMapper } from "../../../../src/application/mappers/UserMapper.js";

export class UserController {
  constructor(
    private readonly createUserUseCase: RegisterUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const result = createUserSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const registration = await this.createUserUseCase.execute(result.data);

    return reply.status(201).send({
      verificationId: registration.verificationId,
    });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const { user, authorization } = await this.getCurrentUserUseCase.execute(
      request.userId!,
    );

    return reply
      .status(200)
      .send(UserMapper.toResponse(user, authorization));
  }

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const users = await this.getAllUsersUseCase.execute();

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
    const user = await this.getUserByIdUseCase.execute(request.params.id);

    return reply.status(200).send(user);
  }
}
