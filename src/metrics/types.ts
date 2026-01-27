/**
 * Raw operation metrics from Sentry (not computed/aggregated)
 */
export interface RawOperationMetrics {
  requestCount: number;
  totalDurationMs: number;
  errorCount: number;
  responseCacheHit: number;
  responseCacheMiss: number;
}

/**
 * Aggregated operation metrics with computed fields
 */
export interface AggregatedOperationMetrics {
  requestCount: number;
  avgDurationMs: number;
  totalDurationMs: number;
  errorCount: number;
  errorRate: number;
  cacheHitRate: number;
  responseCacheHit: number;
  responseCacheMiss: number;
}

/**
 * Raw resolver metrics from Sentry (not computed/aggregated)
 */
export interface RawResolverMetrics {
  count: number;
  totalDurationMs: number;
  errorCount: number;
}

/**
 * Aggregated resolver metrics with computed fields
 */
export interface AggregatedResolverMetrics {
  count: number;
  avgDurationMs: number;
  errorCount: number;
}

/**
 * Metrics response from API endpoints
 */
export interface MetricsResponse {
  release: string;
  collectedAt: string;
  operations: Record<string, AggregatedOperationMetrics>;
  resolvers: Record<string, Record<string, AggregatedResolverMetrics>>;
}

/**
 * Release metrics for multi-release comparison
 */
export interface ReleaseMetrics {
  release: string;
  collectedAt: string;
  operations: Record<string, AggregatedOperationMetrics>;
}

/**
 * Comparison data for charts
 */
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
