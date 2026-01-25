import { ApolloServerPlugin } from "@apollo/server";
import * as Sentry from "@sentry/nextjs";
import { format, scaleLinear } from "d3";
import { GraphQLResolveInfo } from "graphql";
import { debounce, maxBy } from "lodash";

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
 * Apollo Server plugin for collecting GraphQL metrics via Sentry distributed tracing.
 *
 * Features:
 * 1. Creates Sentry span for each GraphQL operation (using startInactiveSpan for manual lifecycle)
 * 2. Creates child spans for each resolver execution (nested within operation span)
 * 3. Tracks cache hits/misses as span attributes
 * 4. Groups metrics by Sentry release for filtering
 * 5. Periodic debounced console logging with visual bar charts (for development)
 *
 * Implementation notes:
 * - Uses startInactiveSpan() to create long-lived spans that survive across callbacks
 * - Uses withActiveSpan() to set parent context when starting child spans
 * - Manually calls span.end() in willSendResponse to finish the operation span
 *
 * Metrics collected:
 * - Operation span: operation name, duration, cache hit/miss
 * - Resolver spans: field path, duration, errors (as children of operation span)
 *
 * @param enabled - Whether to enable Sentry tracing and console logging
 */
export const createSentryMetricsPlugin = (
  enabled: boolean = true
): ApolloServerPlugin => {
  if (!enabled) {
    return {};
  }

  return {
    async requestDidStart(requestContext) {
      let operationName: string | null = null;
      let operationSpan: ReturnType<typeof Sentry.startInactiveSpan> | null =
        null;

      return {
        async didResolveOperation(context) {
          // Capture operation name (or use "anonymous" for unnamed queries)
          operationName = context.operationName || "anonymous";

          // Start Sentry span for this GraphQL operation (manual control)
          operationSpan = Sentry.startInactiveSpan({
            name: operationName,
            op: "graphql.operation",
            attributes: {
              operation_type: context.operation?.operation || "unknown", // "query" or "mutation"
            },
          });
        },

        async executionDidStart() {
          return {
            willResolveField({ info }) {
              // Track resolver execution with Sentry span
              const fieldPath = getFieldPath(info);

              // Start child span for this resolver within the operation span context
              let resolverSpan: ReturnType<typeof Sentry.startInactiveSpan> | null =
                null;

              if (operationSpan) {
                // Make the operation span active and start a child span
                resolverSpan = Sentry.withActiveSpan(operationSpan, () => {
                  return Sentry.startInactiveSpan({
                    op: "graphql.resolver",
                    name: fieldPath,
                  });
                });
              }

              // Return callback to finish span when resolver completes
              return (error) => {
                if (resolverSpan) {
                  if (error) {
                    resolverSpan.setStatus({ code: 2, message: "internal_error" });
                    resolverSpan.setAttribute("error", true);
                  }
                  resolverSpan.end();
                }
              };
            },
          };
        },

        async didEncounterErrors(context) {
          // Record errors on operation span
          if (operationSpan) {
            operationSpan.setStatus({ code: 2, message: "internal_error" });
          }

          // Capture each error in Sentry
          context.errors.forEach((error) => {
            Sentry.captureException(error, {
              tags: {
                operation: operationName || "unknown",
              },
            });
          });
        },

        async willSendResponse() {
          if (!operationName || !operationSpan) {
            return;
          }

          // Track cache metrics
          const cacheHit = requestContext.metrics.responseCacheHit ? 1 : 0;

          // Record cache metrics as attributes on the operation span
          operationSpan.setAttribute("cache_hit", cacheHit);
          operationSpan.setAttribute("cache_miss", cacheHit ? 0 : 1);

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

          // Finish the operation span (sends to Sentry)
          operationSpan.end();
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
