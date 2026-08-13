import { AppError } from "./AppError.js";

export class TooManyVerificationAttemptsError extends AppError {
  readonly statusCode = 429;
  readonly code = "TOO_MANY_VERIFICATION_ATTEMPTS";

  constructor() {
    super("Too many verification attempts");
  }
}