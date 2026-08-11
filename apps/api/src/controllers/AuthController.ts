import type { FastifyReply, FastifyRequest } from "fastify";

import {
  registerSchema,
  type RegisterInput,
} from "../../../../src/application/validation/auth/registerSchema.js";

import {
  loginSchema,
  type LoginInput,
} from "../../../../src/application/validation/auth/loginSchema.js";

import type { LoginUserUseCase } from "../../../../src/application/use-cases/auth/LoginUserUseCase.js";
import type { LogoutUseCase } from "../../../../src/application/use-cases/auth/LogoutUseCase.js";

import type { RegisterUserUseCase } from "../../../../src/application/use-cases/auth/RegisterUserUseCase.js";

import { ValidationError } from "../../../../src/shared/errors/ValidationError.js";
import { RefreshTokenUseCase } from "../../../../src/application/use-cases/auth/RefreshTokenUseCase.js";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply,
  ) {
    const result = registerSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const user = await this.registerUserUseCase.execute(result.data);

    return reply.status(201).send({
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    });
  }

  async login(
    request: FastifyRequest<{
      Body: LoginInput;
    }>,
    reply: FastifyReply,
  ) {
    const result = loginSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const context = {
      ipAddress: request.ip,
      deviceInfo: request.headers["user-agent"] ?? null,
    };

    const tokens = await this.loginUserUseCase.execute(result.data, context);

    return reply.status(200).send(tokens);
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      refreshToken?: string;
    };

    if (!body.refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const result = await this.refreshTokenUseCase.execute({
      refreshToken: body.refreshToken,
    });

    return reply.status(200).send(result);
  }
  async logout(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      refreshToken?: string;
    };

    if (!body.refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    await this.logoutUseCase.execute({
      refreshToken: body.refreshToken,
    });

    return reply.status(204).send();
  }
}
