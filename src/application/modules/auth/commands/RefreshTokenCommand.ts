import type { ICommand } from "../../../bus/ICommand.js";
import type { RefreshTokenInput } from "../dto/RefreshTokenInput.js";
import type { RefreshTokenResult } from "./RefreshTokenCommandHandler.js";

export class RefreshTokenCommand implements ICommand {
  static readonly COMMAND_TYPE = "refreshToken.command";

  readonly commandType = RefreshTokenCommand.COMMAND_TYPE;

  declare readonly __result?: RefreshTokenResult;

  constructor(
    public readonly input: RefreshTokenInput
  ) {}
}
