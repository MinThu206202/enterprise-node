import type { ApiMeta } from "./ApiMeta.js";

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiFailureResponse {
  data: null;
  error: ApiErrorResponse;
  meta: ApiMeta;
}
