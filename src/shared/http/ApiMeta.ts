export type ApiResponseStatus = "SUCCESS" | "ERROR";

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  version: string;
  status: ApiResponseStatus;
  executionTimeMs: number;
}
