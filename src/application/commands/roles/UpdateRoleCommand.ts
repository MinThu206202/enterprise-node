import type { ICommand } from "../../bus/ICommand.js";
import type { UpdateRoleInput } from "../../dto/roles/UpdateRoleInput.js";

export class UpdateRoleCommand implements ICommand {
  static readonly COMMAND_TYPE = "role.update";

  readonly commandType = UpdateRoleCommand.COMMAND_TYPE;

  constructor(
    public readonly id: string,
    public readonly input: UpdateRoleInput,
  ) {}
}
