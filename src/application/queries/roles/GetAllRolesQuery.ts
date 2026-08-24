import type { IQuery } from "../../bus/IQuery.js";

export class GetAllRolesQuery implements IQuery {
  static readonly QUERY_TYPE = "role.getAll";

  readonly queryType = GetAllRolesQuery.QUERY_TYPE;
}
