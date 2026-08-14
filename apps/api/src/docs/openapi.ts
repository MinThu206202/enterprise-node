export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Enterprise Node API",
    version: "1.0.0",
    description: "HTTP API documentation",
  },
  servers: [
    {
      // Same origin as the Swagger page (avoids localhost vs 127.0.0.1 CORS).
      url: "/",
      description: "Current host",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiMeta: {
        type: "object",
        properties: {
          requestId: { type: "string" },
          timestamp: { type: "string" },
          durationMs: { type: "number" },
          status: { type: "string" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "name", "password"],
        properties: {
          email: { type: "string", format: "email" },
          name: { type: "string", minLength: 2, maxLength: 100 },
          password: { type: "string", minLength: 8, maxLength: 128 },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
      },
      RefreshRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      VerifyEmailRequest: {
        type: "object",
        required: ["verificationId", "otp"],
        properties: {
          verificationId: { type: "string", format: "uuid" },
          otp: {
            type: "string",
            pattern: "^\\d{6}$",
            description: "6-digit OTP",
          },
        },
      },
      ResendVerificationRequest: {
        type: "object",
        required: ["verificationId"],
        properties: {
          verificationId: { type: "string", format: "uuid" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API is running",
          },
        },
      },
    },
    "/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Registration started; verification required",
          },
        },
      },
    },
    "/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Access and refresh tokens",
          },
        },
      },
    },
    "/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "New tokens",
          },
        },
      },
    },
    "/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
            },
          },
        },
        responses: {
          "204": {
            description: "Logged out",
          },
        },
      },
    },
    "/v1/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify email with OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyEmailRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Email verified",
          },
        },
      },
    },
    "/v1/auth/resend-verification": {
      post: {
        tags: ["Auth"],
        summary: "Resend verification email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ResendVerificationRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Verification email resent",
          },
        },
      },
    },
    "/v1/users": {
      post: {
        tags: ["Users"],
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User created",
          },
        },
      },
    },
    "/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user profile",
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
  },
} as const;
