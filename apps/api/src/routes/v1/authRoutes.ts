import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { AuthController } from "../../controllers/AuthController.js";

import type { RegisterInput } from "../../../../../src/application/validation/auth/registerSchema.js";
import type { LoginInput } from "../../../../../src/application/validation/auth/loginSchema.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const controller = new AuthController(
    container.registerUserUseCase,
    container.loginUserUseCase,
    container.refreshTokenUseCase,
    container.logoutUseCase,
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
}
