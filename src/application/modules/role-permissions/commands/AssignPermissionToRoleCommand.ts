import type { ICommand } from "../../../bus/ICommand.js";
import type { AssignPermissionToRoleInput } from "../dto/AssignPermissionToRoleInput.js";

export class AssignPermissionToRoleCommand implements ICommand {
  static readonly COMMAND_TYPE = "assignPermissionToRole.command";

  readonly commandType = AssignPermissionToRoleCommand.COMMAND_TYPE;


  constructor(
    public readonly input: AssignPermissionToRoleInput
  ) {}
}
