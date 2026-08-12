import { AppError } from "./AppError.js";

export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly code = "RATE_LIMIT_EXCEEDED";

  constructor(message = "Too many requests") {
    super(message);
  }
}
