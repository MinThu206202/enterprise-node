import type { ICommand } from "../../../bus/ICommand.js";
import type { VerifyForgotPasswordInput } from "../dto/VerifyForgotPasswordInput.js";
import type { VerifyForgotPasswordResult } from "./VerifyForgotPasswordCommandHandler.js";

export class VerifyForgotPasswordCommand implements ICommand {
  static readonly COMMAND_TYPE = "verifyForgotPassword.command";

  readonly commandType = VerifyForgotPasswordCommand.COMMAND_TYPE;

  declare readonly __result?: VerifyForgotPasswordResult;

  constructor(
    public readonly input: VerifyForgotPasswordInput
  ) {}
}
