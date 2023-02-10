import { ApolloServerPlugin } from "@apollo/server";
import { debounce, maxBy } from "lodash";

type OperationMetric = {
  totalhits: number;
  cachehits: number;
};

type OperationMetrics = Map<string, OperationMetric>;

const metricsLogger = (metricsPerOperation: OperationMetrics) => {
  const keys = [...metricsPerOperation.keys()];
  const longestKey = maxBy(keys, (k) => k.length)!;
  for (let key of metricsPerOperation.keys()) {
    const metric = metricsPerOperation.get(key);
    if (!metric) {
      continue;
    }
    const bar = `${key}${" ".repeat(
      Math.max(longestKey.length - key.length, 0) + 1
    )}${"█".repeat(metric.cachehits)}${"░".repeat(
      Math.max(metric.totalhits - metric.cachehits)
    )}`;
    console.log(bar);
  }
};

export const metricsPlugin = ({
  enabled,
}: {
  enabled: boolean;
}): ApolloServerPlugin => {
  if (enabled === false) {
    return {};
  }
  const metricsPerOperation = new Map<string, OperationMetric>();
  const logMetrics = debounce(metricsLogger, 1000);
  return {
    async requestDidStart(requestContext) {
      return {
        async willSendResponse({ operationName }) {
          if (!operationName) {
            return;
          }
          let metric: OperationMetric | undefined =
            metricsPerOperation.get(operationName);
          if (!metric) {
            metric = {
              totalhits: 0,
              cachehits: 0,
            };
            metricsPerOperation.set(operationName, metric);
          }

          metric.totalhits++;
          if (requestContext.metrics.responseCacheHit) {
            metric.cachehits++;
          }

          logMetrics(metricsPerOperation);
        },
      };
    },
  };
};
