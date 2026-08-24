import type { ICommand } from "../../bus/ICommand.js";
import type { CreateRoleInput } from "../../dto/roles/CreateRoleInput.js";

export class CreateRoleCommand implements ICommand {
  static readonly COMMAND_TYPE = "role.create";

  readonly commandType = CreateRoleCommand.COMMAND_TYPE;

  constructor(public readonly input: CreateRoleInput) {}
}
