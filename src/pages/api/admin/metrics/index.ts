import * as Sentry from "@sentry/nextjs";

import {
  getOperationMetrics,
  getResolverMetrics,
} from "src/lib/metrics/metrics-store";

import type { NextApiRequest, NextApiResponse } from "next";

interface AggregatedOperationMetrics {
  requestCount: number;
  avgDurationMs: number;
  errorCount: number;
  errorRate: number;
  cacheHitRate: number;
  responseCacheHit: number;
  responseCacheMiss: number;
}

interface AggregatedResolverMetrics {
  count: number;
  avgDurationMs: number;
  errorCount: number;
}

interface MetricsResponse {
  release: string;
  collectedAt: string;
  operations: Record<string, AggregatedOperationMetrics>;
  resolvers: Record<string, Record<string, AggregatedResolverMetrics>>;
}

/**
 * Gets the current release identifier for metrics
 */
function getCurrentRelease(): string {
  const client = Sentry.getClient();
  const release = client?.getOptions().release;
  return release || "unknown";
}

/**
 * GET /api/admin/metrics
 *
 * Returns aggregated GraphQL operation and resolver metrics for the current deployment.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch raw metrics from Redis
    const operationMetrics = await getOperationMetrics();
    const resolverMetrics = await getResolverMetrics();

    // Aggregate and compute derived metrics
    const aggregatedOperations: Record<string, AggregatedOperationMetrics> = {};
    for (const [operationName, metrics] of Object.entries(operationMetrics)) {
      const requestCount = metrics.requestCount || 0;
      const totalDurationMs = metrics.totalDurationMs || 0;
      const errorCount = metrics.errorCount || 0;
      const cacheHit = metrics.responseCacheHit || 0;
      const cacheMiss = metrics.responseCacheMiss || 0;
      const totalCacheRequests = cacheHit + cacheMiss;

      aggregatedOperations[operationName] = {
        requestCount,
        avgDurationMs: requestCount > 0 ? totalDurationMs / requestCount : 0,
        errorCount,
        errorRate: requestCount > 0 ? errorCount / requestCount : 0,
        cacheHitRate:
          totalCacheRequests > 0 ? cacheHit / totalCacheRequests : 0,
        responseCacheHit: cacheHit,
        responseCacheMiss: cacheMiss,
      };
    }

    const aggregatedResolvers: Record<
      string,
      Record<string, AggregatedResolverMetrics>
    > = {};
    for (const [operationName, resolvers] of Object.entries(resolverMetrics)) {
      aggregatedResolvers[operationName] = {};
      for (const [fieldPath, metrics] of Object.entries(resolvers)) {
        const count = metrics.count || 0;
        const totalDurationMs = metrics.totalDurationMs || 0;
        const errorCount = metrics.errorCount || 0;

        aggregatedResolvers[operationName][fieldPath] = {
          count,
          avgDurationMs: count > 0 ? totalDurationMs / count : 0,
          errorCount,
        };
      }
    }

    const response: MetricsResponse = {
      release: getCurrentRelease(),
      collectedAt: new Date().toISOString(),
      operations: aggregatedOperations,
      resolvers: aggregatedResolvers,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("[Metrics API] Error fetching metrics:", error);
    res.status(500).json({
      error: "Failed to fetch metrics",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
