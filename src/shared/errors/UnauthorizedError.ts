import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "Unauthorized";

  constructor(message: string) {
    super(message);
  }
}
