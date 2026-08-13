import { AppError } from "./AppError.js";

export class InvalidVerificationCodeError extends AppError {
  readonly statusCode =  400;
  readonly code = "INVALID_VERIFICATION_CODE";

  constructor() {
    super("Invalid verification code");
  }
}
