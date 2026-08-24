import type { ICommand, ICommandHandler } from "./ICommand.js";

export class CommandBus {
  private readonly handlers = new Map<
    string,
    ICommandHandler<ICommand, unknown>
  >();

  register<TCommand extends ICommand, TResult>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>,
  ): void {
    if (this.handlers.has(commandType)) {
      throw new Error(
        `A handler is already registered for command "${commandType}"`,
      );
    }

    this.handlers.set(
      commandType,
      handler as unknown as ICommandHandler<ICommand, unknown>,
    );
  }

  async execute<C extends ICommand>(command: C): Promise<C extends { __result?: infer R } ? R : void> {
    const handler = this.handlers.get(command.commandType);

    if (!handler) {
      throw new Error(
        `No handler registered for command "${command.commandType}"`,
      );
    }

    return handler.execute(command) as Promise<
      C extends { __result?: infer R } ? R : void
    >;
  }
}
