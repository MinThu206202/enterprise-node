// src/application/services/database/IUnitOfWork.ts

import type { ITransactionContext } from "./ITransactionContext.js";

export interface IUnitOfWork {
  execute<T>(
    callback: (context: ITransactionContext) => Promise<T>,
  ): Promise<T>;
}
