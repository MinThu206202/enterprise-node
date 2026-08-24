import type { IQuery } from "../../bus/IQuery.js";

export class GetRoleQuery implements IQuery {
  static readonly QUERY_TYPE = "role.get";

  readonly queryType = GetRoleQuery.QUERY_TYPE;

  constructor(public readonly id: string) {}
}
