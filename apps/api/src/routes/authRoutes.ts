import type { FastifyInstance } from "fastify";

import { container } from "../container.js";
import { AuthController } from "../controllers/AuthController.js";

import type { RegisterInput } from "../../../../src/application/validation/auth/registerSchema.js";
import type { LoginInput } from "../../../../src/application/validation/auth/loginSchema.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const controller = new AuthController(
    container.registerUserUseCase,
    container.loginUserUseCase,
    container.refreshTokenUseCase,
  );

  app.post<{ Body: RegisterInput }>(
    "/auth/register",
    async (request, reply) => {
      return controller.register(request, reply);
    },
  );

  app.post<{ Body: LoginInput }>("/auth/login", async (request, reply) => {
    return controller.login(request, reply);
  });

  app.post("/auth/refresh", async (request, reply) => {
    return controller.refresh(request, reply);
  });
}
