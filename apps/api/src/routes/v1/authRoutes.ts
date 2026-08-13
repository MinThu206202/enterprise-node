import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { AuthController } from "../../controllers/AuthController.js";

import type { RegisterInput } from "../../../../../src/application/validation/auth/registerSchema.js";
import type { LoginInput } from "../../../../../src/application/validation/auth/loginSchema.js";
import { VerifyEmailInput } from "../../../../../src/application/validation/auth/verifyEmailSchema.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const controller = new AuthController(
    container.registerUserUseCase,
    container.loginUserUseCase,
    container.refreshTokenUseCase,
    container.logoutUseCase,
    container.verifyEmailUseCase,
    container.resendVerificationUseCase,
  );

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
}
