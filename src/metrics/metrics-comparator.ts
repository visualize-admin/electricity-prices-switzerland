import type {
  AggregatedOperationMetrics,
  MetricsResponse,
} from "./types";

export interface Delta {
  current: number;
  baseline: number | null;
  percentChange: number | null;
  isImprovement: boolean | null;
}

export interface OperationComparison {
  operationName: string;
  isNew: boolean;
  current: AggregatedOperationMetrics;
  baseline: AggregatedOperationMetrics | null;
  deltas: {
    requestCount: Delta;
    avgDurationMs: Delta;
    cacheHitRate: Delta;
    errorRate: Delta;
  };
}

function calculateDelta(
  current: number,
  baseline: number | null,
  lowerIsBetter: boolean
): Delta {
  if (baseline === null || baseline === 0) {
    return {
      current,
      baseline,
      percentChange: null,
      isImprovement: null,
    };
  }

  const percentChange = ((current - baseline) / baseline) * 100;

  // Determine if it's an improvement based on metric type
  let isImprovement: boolean | null = null;
  if (percentChange !== 0) {
    if (lowerIsBetter) {
      // For duration and error rate, negative change is good
      isImprovement = percentChange < 0;
    } else {
      // For cache hit rate, positive change is good
      isImprovement = percentChange > 0;
    }
  }

  return {
    current,
    baseline,
    percentChange,
    isImprovement,
  };
}

export function compareMetrics(
  current: MetricsResponse,
  baseline: MetricsResponse | null
): OperationComparison[] {
  const comparisons: OperationComparison[] = [];

  // Compare all operations in current metrics
  for (const [operationName, currentOp] of Object.entries(
    current.operations
  )) {
    const baselineOp = baseline?.operations[operationName] || null;
    const isNew = baselineOp === null;

    comparisons.push({
      operationName,
      isNew,
      current: currentOp,
      baseline: baselineOp,
      deltas: {
        requestCount: calculateDelta(
          currentOp.requestCount,
          baselineOp?.requestCount ?? null,
          false // neutral - no improvement direction
        ),
        avgDurationMs: calculateDelta(
          currentOp.avgDurationMs,
          baselineOp?.avgDurationMs ?? null,
          true // lower is better
        ),
        cacheHitRate: calculateDelta(
          currentOp.cacheHitRate,
          baselineOp?.cacheHitRate ?? null,
          false // higher is better
        ),
        errorRate: calculateDelta(
          currentOp.errorRate,
          baselineOp?.errorRate ?? null,
          true // lower is better
        ),
      },
    });
  }

  return comparisons;
}

export function calculateSummaryStats(
  comparisons: OperationComparison[]
): {
  avgDurationChange: number | null;
  avgCacheHitRateChange: number | null;
  totalRequests: number;
  baselineTotalRequests: number | null;
} {
  let totalDurationChange = 0;
  let durationChangeCount = 0;
  let totalCacheHitRateChange = 0;
  let cacheHitRateChangeCount = 0;
  let totalRequests = 0;
  let baselineTotalRequests = 0;
  let hasBaselineRequests = false;

  for (const comp of comparisons) {
    totalRequests += comp.current.requestCount;

    if (comp.baseline) {
      baselineTotalRequests += comp.baseline.requestCount;
      hasBaselineRequests = true;

      if (comp.deltas.avgDurationMs.percentChange !== null) {
        totalDurationChange += comp.deltas.avgDurationMs.percentChange;
        durationChangeCount++;
      }

      if (comp.deltas.cacheHitRate.percentChange !== null) {
        totalCacheHitRateChange += comp.deltas.cacheHitRate.percentChange;
        cacheHitRateChangeCount++;
      }
    }
  }

  return {
    avgDurationChange:
      durationChangeCount > 0 ? totalDurationChange / durationChangeCount : null,
    avgCacheHitRateChange:
      cacheHitRateChangeCount > 0
        ? totalCacheHitRateChange / cacheHitRateChangeCount
        : null,
    totalRequests,
    baselineTotalRequests: hasBaselineRequests ? baselineTotalRequests : null,
  };
}
