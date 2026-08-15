import type { FastifyReply, FastifyRequest } from "fastify";

import {
  registerSchema,
  type RegisterInput,
} from "../../../../src/application/validation/auth/registerSchema.js";

import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "../../../../src/application/validation/auth/verifyEmailSchema.js";

import type { VerifyEmailUseCase } from "../../../../src/application/use-cases/auth/VerifyEmailUseCase.js";

import {
  loginSchema,
  type LoginInput,
} from "../../../../src/application/validation/auth/loginSchema.js";

import type { LoginUserUseCase } from "../../../../src/application/use-cases/auth/LoginUserUseCase.js";
import type { LogoutUseCase } from "../../../../src/application/use-cases/auth/LogoutUseCase.js";

import type { RegisterUserUseCase } from "../../../../src/application/use-cases/auth/RegisterUserUseCase.js";

import { ValidationError } from "../../../../src/shared/errors/ValidationError.js";
import { RefreshTokenUseCase } from "../../../../src/application/use-cases/auth/RefreshTokenUseCase.js";
import { createApiMeta } from "../../../../src/shared/http/ApiResponseBuilder.js";
import { resendVerificationSchema } from "../../../../src/application/validation/auth/resendVerificationSchema.js";
import { ResendVerificationUseCase } from "../../../../src/application/use-cases/auth/ResendVerificationUseCase.js";

import {
  requestForgotPasswordSchema,
  type RequestForgotPasswordInput,
} from "../../../../src/application/validation/auth/requestForgotPasswordSchema.js";
import {
  resendForgotPasswordSchema,
  type ResendForgotPasswordInput,
} from "../../../../src/application/validation/auth/resendForgotPasswordSchema.js";
import {
  verifyForgotPasswordSchema,
  type VerifyForgotPasswordInput,
} from "../../../../src/application/validation/auth/verifyForgotPasswordSchema.js";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "../../../../src/application/validation/auth/resetPasswordSchema.js";

import type { RequestForgotPasswordUseCase } from "../../../../src/application/use-cases/auth/RequestForgotPasswordUseCase.js";
import type { ResendForgotPasswordUseCase } from "../../../../src/application/use-cases/auth/ResendForgotPasswordUseCase.js";
import type { VerifyForgotPasswordUseCase } from "../../../../src/application/use-cases/auth/VerifyForgotPasswordUseCase.js";
import type { ResetPasswordUseCase } from "../../../../src/application/use-cases/auth/ResetPasswordUseCase.js";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly requestForgotPasswordUseCase: RequestForgotPasswordUseCase,
    private readonly resendForgotPasswordUseCase: ResendForgotPasswordUseCase,
    private readonly verifyForgotPasswordUseCase: VerifyForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
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

    const registration = await this.registerUserUseCase.execute(result.data);

    return reply.status(201).send({
      verificationId: registration.verificationId,
      meta: createApiMeta({
        requestId: request.id,
        startTime: request.startTime,
        status: "SUCCESS",
      }),
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

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    const result = verifyEmailSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(","),
      );
    }

    const input: VerifyEmailInput = result.data;

    const user = await this.verifyEmailUseCase.execute(input);

    return reply.status(200).send({
      data: user,

      meta: createApiMeta({
        requestId: request.id,
        startTime: request.startTime,
        status: "SUCCESS",
      }),
    });
  }

  async resendVerification(request: FastifyRequest, reply: FastifyReply) {
    const result = resendVerificationSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(","),
      );
    }

    const resultData = await this.resendVerificationUseCase.execute(
      result.data,
    );
    return reply.status(200).send({
      data: resultData,

      meta: createApiMeta({
        requestId: request.id,
        startTime: request.startTime,
        status: "SUCCESS",
      }),
    });
  }

  async requestForgotPassword(
    request: FastifyRequest<{ Body: RequestForgotPasswordInput }>,
    reply: FastifyReply,
  ) {
    const result = requestForgotPasswordSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(","),
      );
    }

    const data = await this.requestForgotPasswordUseCase.execute(result.data);

    return reply.status(200).send({
      data,

      meta: createApiMeta({
        requestId: request.id,
        startTime: request.startTime,
        status: "SUCCESS",
      }),
    });
  }

  async resendForgotPassword(
    request: FastifyRequest<{ Body: ResendForgotPasswordInput }>,
    reply: FastifyReply,
  ) {
    const result = resendForgotPasswordSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(","),
      );
    }

    const data = await this.resendForgotPasswordUseCase.execute(result.data);

    return reply.status(200).send({
      data,

      meta: createApiMeta({
        requestId: request.id,
        startTime: request.startTime,
        status: "SUCCESS",
      }),
    });
  }

  async verifyForgotPassword(
    request: FastifyRequest<{ Body: VerifyForgotPasswordInput }>,
    reply: FastifyReply,
  ) {
    const result = verifyForgotPasswordSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(","),
      );
    }

    const data = await this.verifyForgotPasswordUseCase.execute(result.data);

    return reply.status(200).send({
      data,

      meta: createApiMeta({
        requestId: request.id,
        startTime: request.startTime,
        status: "SUCCESS",
      }),
    });
  }

  async resetPassword(
    request: FastifyRequest<{ Body: ResetPasswordInput }>,
    reply: FastifyReply,
  ) {
    const result = resetPasswordSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(","),
      );
    }

    const data = await this.resetPasswordUseCase.execute(result.data);

    return reply.status(200).send({
      data,

      meta: createApiMeta({
        requestId: request.id,
        startTime: request.startTime,
        status: "SUCCESS",
      }),
    });
  }
}
