import type { ICommand } from "../../../bus/ICommand.js";
import type { LoginUserInput } from "../dto/LoginUserInput.js";
import type { RequestContext } from "../../../context/RequestContext.js";
import type { LoginUserResult } from "./LoginUserCommandHandler.js";

export class LoginUserCommand implements ICommand {
  static readonly COMMAND_TYPE = "loginUser.command";

  readonly commandType = LoginUserCommand.COMMAND_TYPE;

  declare readonly __result?: LoginUserResult;

  constructor(
    public readonly input: LoginUserInput,
    public readonly context: RequestContext
  ) {}
}
