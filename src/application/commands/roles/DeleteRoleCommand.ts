import type { ICommand } from "../../bus/ICommand.js";

export class DeleteRoleCommand implements ICommand {
  static readonly COMMAND_TYPE = "role.delete";

  readonly commandType = DeleteRoleCommand.COMMAND_TYPE;

  constructor(public readonly id: string) {}
}
