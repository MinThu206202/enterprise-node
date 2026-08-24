import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { AuthController } from "../../controllers/AuthController.js";

import type { VerifyLoginOtpInput } from "../../../../../src/application/validation/auth/verifyLoginOtpSchema.js";

import type { RegisterInput } from "../../../../../src/application/validation/auth/registerSchema.js";
import type { LoginInput } from "../../../../../src/application/validation/auth/loginSchema.js";
import { VerifyEmailInput } from "../../../../../src/application/validation/auth/verifyEmailSchema.js";
import { RequestForgotPasswordInput } from "../../../../../src/application/validation/auth/requestForgotPasswordSchema.js";
import { ResendForgotPasswordInput } from "../../../../../src/application/validation/auth/resendForgotPasswordSchema.js";
import { VerifyForgotPasswordInput } from "../../../../../src/application/validation/auth/verifyForgotPasswordSchema.js";
import { ResetPasswordInput } from "../../../../../src/application/validation/auth/resetPasswordSchema.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const controller = new AuthController(
    container.commandBus,);

  // Register
  app.post<{ Body: RegisterInput }>(
    "/auth/register",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.register(request, reply);
    },
  );

  // Login
  app.post<{ Body: LoginInput }>(
    "/auth/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.login(request, reply);
    },
  );

  // Refresh
  app.post(
    "/auth/refresh",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.refresh(request, reply);
    },
  );

  // Logout
  app.post(
    "/auth/logout",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.logout(request, reply);
    },
  );

  //verify
  app.post<{ Body: VerifyEmailInput }>(
    "/auth/verify-email",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.verifyEmail(request, reply);
    },
  );

  //resend
  app.post(
    "/auth/resend-verification",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "10 minutes",
        },
      },
    },
    async (request, reply) => {
      return controller.resendVerification(request, reply);
    },
  );

  // forgot password
  app.post<{ Body: RequestForgotPasswordInput }>(
    "/auth/forgot-password",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.requestForgotPassword(request, reply);
    },
  );

  // resend forgot password
  app.post<{ Body: ResendForgotPasswordInput }>(
    "/auth/resend-forgot-password",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "10 minutes",
        },
      },
    },
    async (request, reply) => {
      return controller.resendForgotPassword(request, reply);
    },
  );

  // verify forgot password (OTP)
  app.post<{ Body: VerifyForgotPasswordInput }>(
    "/auth/verify-forgot-password",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.verifyForgotPassword(request, reply);
    },
  );

  // reset password (newPassword + confirmPassword)
  app.post<{ Body: ResetPasswordInput }>(
    "/auth/reset-password",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.resetPassword(request, reply);
    },
  );

  // verify login OTP (new device)
  app.post<{ Body: VerifyLoginOtpInput }>(
    "/auth/verify-login-otp",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      return controller.verifyLoginOtp(request, reply);
    },
  );
}
