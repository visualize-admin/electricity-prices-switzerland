import { ApolloServerPlugin } from "@apollo/server";
import { format, scaleLinear } from "d3";
import { GraphQLResolveInfo } from "graphql";
import { debounce, maxBy } from "lodash";

import {
  incrementOperationMetrics,
  incrementResolverMetrics,
} from "../../lib/metrics/metrics-store";

/**
 * In-memory metrics for console logging
 */
type ConsoleOperationMetric = {
  totalhits: number;
  cachehits: number;
};

type ConsoleOperationMetrics = Map<string, ConsoleOperationMetric>;

// Global in-memory metrics for periodic console logging
const consoleMetricsPerOperation = new Map<string, ConsoleOperationMetric>();

/**
 * Logs metrics to console with visual bar charts
 */
const metricsLogger = (metricsPerOperation: ConsoleOperationMetrics) => {
  const keys = [...metricsPerOperation.keys()];
  if (keys.length === 0) {
    return;
  }
  const longestKey = maxBy(keys, (k) => k.length)!;
  const highestTotalHitsKey = maxBy(
    keys,
    (k) => metricsPerOperation.get(k)?.totalhits
  )!;

  const operationMetrics = metricsPerOperation.get(highestTotalHitsKey);
  const highestTotalHits = operationMetrics?.totalhits ?? 0;
  const scale = scaleLinear().domain([0, highestTotalHits]).range([0, 20]);

  for (const key of metricsPerOperation.keys()) {
    const metric = metricsPerOperation.get(key);
    if (!metric) {
      continue;
    }
    const { totalhits, cachehits } = metric;
    const spaces = longestKey.length - key.length + 1;
    const filled = scale(cachehits);
    const rest = scale(totalhits - cachehits);
    const bar = `${key}${" ".repeat(spaces)}${"█".repeat(filled)}${"░".repeat(
      rest
    )} ${cachehits}/${totalhits} ${format(".0%")(cachehits / totalhits)}`;
    console.info(bar);
  }
};

// Debounced logger - logs at most once per second
const logMetrics = debounce(metricsLogger, 1000);

/**
 * Apollo Server plugin for collecting and persisting GraphQL metrics.
 *
 * Features:
 * 1. Collects metrics in memory during request (no mid-request Redis calls)
 * 2. Flushes all metrics to Redis once at the end of the request
 * 3. Periodic debounced console logging with visual bar charts
 * 4. Tracks operation-level and resolver-level metrics
 *
 * Metrics collected:
 * - Operation level: request counts, durations, errors, cache hits
 * - Resolver level: execution counts, durations, errors per field
 *
 * @param enabled - Whether to enable Redis persistence and console logging
 */
export const createMetricsPlugin = (
  enabled: boolean = true
): ApolloServerPlugin => {
  if (!enabled) {
    return {};
  }

  return {
    async requestDidStart(requestContext) {
      const startTime = Date.now();
      let operationName: string | null = null;
      let errorCount = 0;

      // Collect resolver metrics in memory during request
      const resolverMetricsBuffer = new Map<
        string,
        { count: number; totalDurationMs: number; errorCount: number }
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

              // Return callback to track resolver completion
              return (error) => {
                const duration = Date.now() - resolverStartTime;
                const hasError = error ? 1 : 0;

                // Accumulate resolver metrics in memory
                const existing = resolverMetricsBuffer.get(fieldPath);
                if (existing) {
                  existing.count += 1;
                  existing.totalDurationMs += duration;
                  existing.errorCount += hasError;
                } else {
                  resolverMetricsBuffer.set(fieldPath, {
                    count: 1,
                    totalDurationMs: duration,
                    errorCount: hasError,
                  });
                }
              };
            },
          };
        },

        async didEncounterErrors(context) {
          // Track operation-level errors in memory
          errorCount += context.errors.length;
        },

        async willSendResponse() {
          if (!operationName) {
            return;
          }

          const duration = Date.now() - startTime;
          const cacheHit = requestContext.metrics.responseCacheHit ? 1 : 0;
          const cacheMiss = cacheHit ? 0 : 1;

          // Update console metrics (in-memory, for periodic logging)
          let consoleMetric = consoleMetricsPerOperation.get(operationName);
          if (!consoleMetric) {
            consoleMetric = {
              totalhits: 0,
              cachehits: 0,
            };
            consoleMetricsPerOperation.set(operationName, consoleMetric);
          }
          consoleMetric.totalhits++;
          if (cacheHit) {
            consoleMetric.cachehits++;
          }

          // Trigger debounced console logging
          logMetrics(consoleMetricsPerOperation);

          // Flush all metrics to Redis in a single batch (asynchronously)
          Promise.all([
            // Flush operation metrics
            incrementOperationMetrics(operationName, {
              requestCount: 1,
              totalDurationMs: duration,
              errorCount,
              responseCacheHit: cacheHit,
              responseCacheMiss: cacheMiss,
            }),
            // Flush all resolver metrics
            ...Array.from(resolverMetricsBuffer.entries()).map(
              ([fieldPath, metrics]) =>
                incrementResolverMetrics(operationName!, fieldPath, metrics)
            ),
          ]).catch((err) => {
            console.error("[Metrics] Failed to flush metrics:", err);
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
function getFieldPath(info: GraphQLResolveInfo): string {
  const path: string[] = [];
  let current: GraphQLResolveInfo["path"] | undefined = info.path;

  // Walk up the path to build the full field path
  while (current) {
    if (typeof current.key === "string") {
      path.unshift(current.key);
    }
    current = current.prev;
  }

  return path.join(".");
}
