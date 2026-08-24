import type { IQuery, IQueryHandler } from "./IQuery.js";

export class QueryBus {
  private readonly handlers = new Map<
    string,
    IQueryHandler<IQuery, unknown>
  >();

  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    if (this.handlers.has(queryType)) {
      throw new Error(
        `A handler is already registered for query "${queryType}"`,
      );
    }

    this.handlers.set(
      queryType,
      handler as unknown as IQueryHandler<IQuery, unknown>,
    );
  }

  async execute<C extends IQuery>(query: C): Promise<C extends { __result?: infer R } ? R : unknown> {
    const handler = this.handlers.get(query.queryType);

    if (!handler) {
      throw new Error(`No handler registered for query "${query.queryType}"`);
    }

    return handler.execute(query) as Promise<
      C extends { __result?: infer R } ? R : unknown
    >;
  }
}
