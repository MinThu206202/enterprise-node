import type { ICommand } from "../../bus/ICommand.js";
import type { RemoveRoleFromUserInput } from "../../dto/userRoles/RemoveRoleFromUserInput.js";

export class RemoveRoleFromUserCommand implements ICommand {
  static readonly COMMAND_TYPE = "removeRoleFromUser.command";

  readonly commandType = RemoveRoleFromUserCommand.COMMAND_TYPE;


  constructor(
    public readonly input: RemoveRoleFromUserInput
  ) {}
}
