import { AppError } from "./AppError.js";

export class VerificaionExpiredError extends AppError {
  readonly statusCode = 400;
  readonly code = "VERIFICATION_EXPIRED";

  constructor() {
    super("Verification has expired or is invalid");
  }
}
