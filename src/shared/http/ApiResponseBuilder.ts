import type { ApiMeta } from "./ApiMeta.js";
import { API_VERSION } from "./ApiVersion.js";

export function createApiMeta(options: {
  requestId: string;
  startTime: number;
  status: ApiMeta["status"];
}): ApiMeta {
  return {
    requestId: options.requestId,
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    status: options.status,
    executionTimeMs: Number((performance.now() - options.startTime).toFixed(2)),
  };
}
