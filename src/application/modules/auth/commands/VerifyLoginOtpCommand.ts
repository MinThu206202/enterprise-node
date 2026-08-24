import type { ICommand } from "../../../bus/ICommand.js";
import type { VerifyLoginOtpInput } from "../dto/VerifyLoginOtpInput.js";
import type { VerifyLoginOtpResult } from "../dto/VerifyLoginOtpResult.js";

export class VerifyLoginOtpCommand implements ICommand {
  static readonly COMMAND_TYPE = "verifyLoginOtp.command";

  readonly commandType = VerifyLoginOtpCommand.COMMAND_TYPE;

  declare readonly __result?: VerifyLoginOtpResult;

  constructor(
    public readonly input: VerifyLoginOtpInput
  ) {}
}
