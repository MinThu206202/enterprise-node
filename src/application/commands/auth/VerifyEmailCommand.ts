import type { ICommand } from "../../bus/ICommand.js";
import type { RequestContext } from "../../context/RequestContext.js";
import type { VerifyEmailInput } from "../../validation/auth/verifyEmailSchema.js";
import type { VerifyEmailResult } from "./VerifyEmailCommandHandler.js";

export class VerifyEmailCommand implements ICommand {
  static readonly COMMAND_TYPE = "verifyEmail.command";

  readonly commandType = VerifyEmailCommand.COMMAND_TYPE;

  declare readonly __result?: VerifyEmailResult;

  constructor(
    public readonly input: VerifyEmailInput,
    public readonly context: RequestContext
  ) {}
}
