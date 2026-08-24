import type { ICommand } from "../../bus/ICommand.js";
import type { RegisterUserInput } from "../../dto/auth/RegisterUserInput.js";
import type { RegisterUserResult } from "./RegisterUserCommandHandler.js";

export class RegisterUserCommand implements ICommand {
  static readonly COMMAND_TYPE = "registerUser.command";

  readonly commandType = RegisterUserCommand.COMMAND_TYPE;

  declare readonly __result?: RegisterUserResult;

  constructor(
    public readonly input: RegisterUserInput
  ) {}
}
