import type { ICommand } from "../../bus/ICommand.js";
import type { LogoutInput } from "../../dto/auth/LogoutInput.js";

export class LogoutCommand implements ICommand {
  static readonly COMMAND_TYPE = "logout.command";

  readonly commandType = LogoutCommand.COMMAND_TYPE;


  constructor(
    public readonly input: LogoutInput
  ) {}
}
