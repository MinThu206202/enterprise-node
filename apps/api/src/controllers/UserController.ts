import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createUserSchema,
  type CreateUserInput,
} from "../../../../src/application/validation/users/createUserSchema.js";

import type { RegisterUserUseCase } from "../../../../src/application/use-cases/auth/RegisterUserUseCase.js";

import { ValidationError } from "../../../../src/shared/errors/ValidationError.js";

export class UserController {
  constructor(private readonly createUserUseCase: RegisterUserUseCase) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const result = createUserSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const input: CreateUserInput = result.data;

    const user = await this.createUserUseCase.execute(input);

    return reply.status(201).send({
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    });
  }
}
