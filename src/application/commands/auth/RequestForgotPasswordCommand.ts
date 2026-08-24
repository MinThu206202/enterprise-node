import type { ICommand } from "../../bus/ICommand.js";
import type { RequestForgotPasswordInput } from "../../dto/auth/RequestForgotPasswordInput.js";
import type { RequestForgotPasswordResult } from "./RequestForgotPasswordCommandHandler.js";

export class RequestForgotPasswordCommand implements ICommand {
  static readonly COMMAND_TYPE = "requestForgotPassword.command";

  readonly commandType = RequestForgotPasswordCommand.COMMAND_TYPE;

  declare readonly __result?: RequestForgotPasswordResult;

  constructor(
    public readonly input: RequestForgotPasswordInput
  ) {}
}
