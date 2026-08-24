import type { ICommand } from "../../../bus/ICommand.js";
import type { ResendVerificationInput } from "../validation/resendVerificationSchema.js";
import type { ResendVerificationResult } from "./ResendVerificationCommandHandler.js";

export class ResendVerificationCommand implements ICommand {
  static readonly COMMAND_TYPE = "resendVerification.command";

  readonly commandType = ResendVerificationCommand.COMMAND_TYPE;

  declare readonly __result?: ResendVerificationResult;

  constructor(
    public readonly input: ResendVerificationInput
  ) {}
}
