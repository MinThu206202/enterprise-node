import type { ICommand } from "../../bus/ICommand.js";
import type { ResetPasswordInput } from "../../dto/auth/ResetPasswordInput.js";
import type { ResetPasswordResult } from "./ResetPasswordCommandHandler.js";

export class ResetPasswordCommand implements ICommand {
  static readonly COMMAND_TYPE = "resetPassword.command";

  readonly commandType = ResetPasswordCommand.COMMAND_TYPE;

  declare readonly __result?: ResetPasswordResult;

  constructor(
    public readonly input: ResetPasswordInput
  ) {}
}
