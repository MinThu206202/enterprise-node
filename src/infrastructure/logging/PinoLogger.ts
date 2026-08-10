import type { Logger } from "pino";

import type { ILogger } from "../../shared/logging/ILogger.js";

export class PinoLogger implements ILogger {
  constructor(private readonly logger: Logger) {}

  info(message: string, context?: object): void {
    this.logger.info(context, message);
  }

  warn(message: string, context?: object): void {
    this.logger.warn(context, message);
  }

  error(message: string, context?: object): void {
    this.logger.error(context, message);
  }

  debug(message: string, context?: object): void {
    this.logger.debug(context, message);
  }
}
