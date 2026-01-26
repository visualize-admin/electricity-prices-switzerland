export type AggregatedOperationMetrics = {
  requestCount: number;
  avgDurationMs: number;
  totalDurationMs: number;
  errorCount: number;
  errorRate: number;
  cacheHitRate: number;
  responseCacheHit: number;
  responseCacheMiss: number;
};

export interface ReleaseMetrics {
  release: string;
  collectedAt: string;
  operations: Record<string, AggregatedOperationMetrics>;
}

export interface ComparisonData {
  operation: string;
  releases: Array<{
    release: string;
    cacheHit: number;
    cacheMiss: number;
    total: number;
    hitRate: number;
    totalDurationMs: number;
  }>;
}
