import type { ICommand } from "../../../bus/ICommand.js";
import type { ResendForgotPasswordInput } from "../dto/ResendForgotPasswordInput.js";
import type { ResendForgotPasswordResult } from "./ResendForgotPasswordCommandHandler.js";

export class ResendForgotPasswordCommand implements ICommand {
  static readonly COMMAND_TYPE = "resendForgotPassword.command";

  readonly commandType = ResendForgotPasswordCommand.COMMAND_TYPE;

  declare readonly __result?: ResendForgotPasswordResult;

  constructor(
    public readonly input: ResendForgotPasswordInput
  ) {}
}
