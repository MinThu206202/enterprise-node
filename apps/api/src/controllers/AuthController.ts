import type { FastifyReply, FastifyRequest } from "fastify";

import { RegisterUserCommand } from "../../../../src/application/commands/auth/RegisterUserCommand.js";
import { LoginUserCommand } from "../../../../src/application/commands/auth/LoginUserCommand.js";
import { RefreshTokenCommand } from "../../../../src/application/commands/auth/RefreshTokenCommand.js";
import { LogoutCommand } from "../../../../src/application/commands/auth/LogoutCommand.js";
import { VerifyEmailCommand } from "../../../../src/application/commands/auth/VerifyEmailCommand.js";
import { ResendVerificationCommand } from "../../../../src/application/commands/auth/ResendVerificationCommand.js";
import { RequestForgotPasswordCommand } from "../../../../src/application/commands/auth/RequestForgotPasswordCommand.js";
import { ResendForgotPasswordCommand } from "../../../../src/application/commands/auth/ResendForgotPasswordCommand.js";
import { VerifyForgotPasswordCommand } from "../../../../src/application/commands/auth/VerifyForgotPasswordCommand.js";
import { ResetPasswordCommand } from "../../../../src/application/commands/auth/ResetPasswordCommand.js";
import { VerifyLoginOtpCommand } from "../../../../src/application/commands/auth/VerifyLoginOtpCommand.js";
import type { CommandBus } from "../../../../src/application/bus/CommandBus.js";

import {
  registerSchema,
  type RegisterInput,
} from "../../../../src/application/validation/auth/registerSchema.js";

import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "../../../../src/application/validation/auth/verifyEmailSchema.js";


import {
  loginSchema,
  type LoginInput,
} from "../../../../src/application/validation/auth/loginSchema.js";



import { ValidationError } from "../../../../src/shared/errors/ValidationError.js";
import { resendVerificationSchema } from "../../../../src/application/validation/auth/resendVerificationSchema.js";

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

import { verifyLoginOtpSchema } from "../../../../src/application/validation/auth/verifyLoginOtpSchema.js";

export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
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

    const registration = await this.commandBus.execute(new RegisterUserCommand(result.data));

    return reply.status(201).send({
      verificationId: registration.verificationId,
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

    const tokens = await this.commandBus.execute(new LoginUserCommand(result.data, context));

    return reply.status(200).send(tokens);
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      refreshToken?: string;
    };

    if (!body.refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const result = await this.commandBus.execute(new RefreshTokenCommand({
      refreshToken: body.refreshToken,
    }));

    return reply.status(200).send(result);
  }
  async logout(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      refreshToken?: string;
    };

    if (!body.refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    await this.commandBus.execute(new LogoutCommand({
      refreshToken: body.refreshToken,
    }));

    return reply.status(200).send({ message: "Logged out successfully" });
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    const result = verifyEmailSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(","),
      );
    }

    const input: VerifyEmailInput = result.data;

    const context = {
      ipAddress: request.ip,
      deviceInfo: request.headers["user-agent"] ?? null,
    };

    const user = await this.commandBus.execute(new VerifyEmailCommand(input, context));

    return reply.status(200).send(user);
  }

  async resendVerification(request: FastifyRequest, reply: FastifyReply) {
    const result = resendVerificationSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(","),
      );
    }

    const resultData = await this.commandBus.execute(new ResendVerificationCommand(
      result.data,
    ));
    return reply.status(200).send(resultData);
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

    const data = await this.commandBus.execute(new RequestForgotPasswordCommand(result.data));

    return reply.status(200).send(data);
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

    const data = await this.commandBus.execute(new ResendForgotPasswordCommand(result.data));

    return reply.status(200).send(data);
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

    const data = await this.commandBus.execute(new VerifyForgotPasswordCommand(result.data));

    return reply.status(200).send(data);
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

    const data = await this.commandBus.execute(new ResetPasswordCommand(result.data));

    return reply.status(200).send(data);
  }

  async verifyLoginOtp(request: FastifyRequest, reply: FastifyReply) {
    const input = verifyLoginOtpSchema.parse(request.body);

    const result = await this.commandBus.execute(new VerifyLoginOtpCommand(input));

    return reply.status(200).send(result);
  }
}
