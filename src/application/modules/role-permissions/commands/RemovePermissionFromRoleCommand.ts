import type { ICommand } from "../../../bus/ICommand.js";
import type { AssignPermissionToRoleInput } from "../dto/AssignPermissionToRoleInput.js";

export class RemovePermissionFromRoleCommand implements ICommand {
  static readonly COMMAND_TYPE = "removePermissionFromRole.command";

  readonly commandType = RemovePermissionFromRoleCommand.COMMAND_TYPE;


  constructor(
    public readonly input: AssignPermissionToRoleInput
  ) {}
}
