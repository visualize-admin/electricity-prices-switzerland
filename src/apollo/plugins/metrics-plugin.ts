import { ApolloServerPlugin } from "@apollo/server";
import {
  incrementOperationMetrics,
  incrementResolverMetrics,
} from "../../lib/metrics/metrics-store";

/**
 * Apollo Server plugin for collecting and persisting GraphQL metrics to Redis.
 *
 * Collects metrics at two levels:
 * 1. Operation level: request counts, durations, errors, cache hits
 * 2. Resolver level: execution counts, durations, errors per field
 *
 * Metrics are written to Redis on each request with a 24-hour TTL.
 * Respects METRICS_ENABLED environment variable.
 */
export const createMetricsPlugin = (): ApolloServerPlugin => {
  return {
    async requestDidStart(requestContext) {
      const startTime = Date.now();
      let operationName: string | null = null;
      const resolverMetrics = new Map<
        string,
        { startTime: number; parentPath: string; fieldName: string }
      >();

      return {
        async didResolveOperation(context) {
          // Capture operation name (or use "anonymous" for unnamed queries)
          operationName = context.operationName || "anonymous";
        },

        async executionDidStart() {
          return {
            willResolveField({ info }) {
              // Track resolver start time
              const fieldPath = getFieldPath(info);
              const resolverStartTime = Date.now();

              resolverMetrics.set(fieldPath, {
                startTime: resolverStartTime,
                parentPath: info.path.typename,
                fieldName: info.fieldName,
              });

              // Return callback to track resolver completion
              return (error) => {
                const duration = Date.now() - resolverStartTime;
                const hasError = error ? 1 : 0;

                if (operationName) {
                  // Increment resolver metrics asynchronously (don't block response)
                  incrementResolverMetrics(operationName, fieldPath, {
                    count: 1,
                    totalDurationMs: duration,
                    errorCount: hasError,
                  }).catch((err) => {
                    console.error("[Metrics] Failed to record resolver metrics:", err);
                  });
                }
              };
            },
          };
        },

        async didEncounterErrors(context) {
          // Track operation-level errors
          if (operationName) {
            await incrementOperationMetrics(operationName, {
              errorCount: context.errors.length,
            }).catch((err) => {
              console.error("[Metrics] Failed to record error metrics:", err);
            });
          }
        },

        async willSendResponse(context) {
          if (!operationName) {
            return;
          }

          const duration = Date.now() - startTime;
          const cacheHit = requestContext.metrics.responseCacheHit ? 1 : 0;
          const cacheMiss = cacheHit ? 0 : 1;

          // Increment operation metrics asynchronously
          await incrementOperationMetrics(operationName, {
            requestCount: 1,
            totalDurationMs: duration,
            responseCacheHit: cacheHit,
            responseCacheMiss: cacheMiss,
          }).catch((err) => {
            console.error("[Metrics] Failed to record operation metrics:", err);
          });
        },
      };
    },
  };
};

/**
 * Constructs a field path from GraphQL execution info
 * Format: "typename.field" or "parent.field.subfield"
 */
function getFieldPath(info: any): string {
  const path: string[] = [];
  let current = info.path;

  // Walk up the path to build the full field path
  while (current) {
    if (typeof current.key === "string") {
      path.unshift(current.key);
    }
    current = current.prev;
  }

  return path.join(".");
}
