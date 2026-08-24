import type { ICommand } from "../../../bus/ICommand.js";
import type { AssignRoleToUserInput } from "../dto/AssignRoleToUserInput.js";

export class AssignRoleToUserCommand implements ICommand {
  static readonly COMMAND_TYPE = "assignRoleToUser.command";

  readonly commandType = AssignRoleToUserCommand.COMMAND_TYPE;


  constructor(
    public readonly input: AssignRoleToUserInput
  ) {}
}
