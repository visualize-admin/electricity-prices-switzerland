import { ApolloServerPlugin } from "@apollo/server";
import { format, scaleLinear } from "d3";
import { debounce, maxBy } from "lodash";

type OperationMetric = {
  totalhits: number;
  cachehits: number;
};

type OperationMetrics = Map<string, OperationMetric>;

const metricsLogger = (metricsPerOperation: OperationMetrics) => {
  const keys = [...metricsPerOperation.keys()];
  if (keys.length === 0) {
    return;
  }
  const longestKey = maxBy(keys, (k) => k.length)!;
  const highestTotalHitsKey = maxBy(
    keys,
    (k) => metricsPerOperation.get(k)?.totalhits
  )!;
  const highestTotalHits =
    metricsPerOperation.get(highestTotalHitsKey)?.totalhits!;
  const scale = scaleLinear().domain([0, highestTotalHits]).range([0, 20]);
  for (let key of metricsPerOperation.keys()) {
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
