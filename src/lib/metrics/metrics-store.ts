import { getDeploymentId } from "./deployment-id";
import { getSentryClient } from "./sentry-client";

export interface OperationMetrics {
  requestCount: number;
  totalDurationMs: number;
  errorCount: number;
  responseCacheHit: number;
  responseCacheMiss: number;
}

interface ResolverMetrics {
  count: number;
  totalDurationMs: number;
  errorCount: number;
}

/**
 * Fetches all operation metrics for the current deployment from Sentry
 */
export async function getOperationMetrics(): Promise<
  Record<string, OperationMetrics>
> {
  const client = getSentryClient();
  const deploymentId = getDeploymentId();

  try {
    return await client.getOperationMetrics(deploymentId);
  } catch (error) {
    console.error("[Metrics] Failed to fetch operation metrics:", error);
    return {};
  }
}

/**
 * Fetches all resolver metrics for the current deployment from Sentry
 */
export async function getResolverMetrics(): Promise<
  Record<string, Record<string, ResolverMetrics>>
> {
  const client = getSentryClient();
  const deploymentId = getDeploymentId();

  try {
    // First, get all operations to know which ones to query for resolvers
    const operations = await client.getOperationMetrics(deploymentId);
    const result: Record<string, Record<string, ResolverMetrics>> = {};

    // Fetch resolver metrics for each operation
    for (const operationName of Object.keys(operations)) {
      const resolvers = await client.getResolverMetrics(
        deploymentId,
        operationName
      );
      if (Object.keys(resolvers).length > 0) {
        result[operationName] = resolvers;
      }
    }

    return result;
  } catch (error) {
    console.error("[Metrics] Failed to fetch resolver metrics:", error);
    return {};
  }
}

/**
 * Clears all metrics for the current deployment (no-op for Sentry)
 */
export async function clearMetrics(): Promise<boolean> {
  // No-op: Sentry data cannot be cleared via API
  // This function is kept for backward compatibility
  console.info("[Metrics] Clear metrics not supported with Sentry backend");
  return false;
}

/**
 * Lists all unique deployment IDs that have metrics stored in Sentry
 */
export async function listDeploymentIds(): Promise<string[]> {
  const client = getSentryClient();

  try {
    return await client.listDeploymentIds();
  } catch (error) {
    console.error("[Metrics] Failed to list deployment IDs:", error);
    return [];
  }
}

/**
 * Fetches all operation metrics for a specific deployment ID from Sentry
 */
export async function getOperationMetricsByDeploymentId(
  deploymentId: string
): Promise<Record<string, OperationMetrics>> {
  const client = getSentryClient();

  try {
    return await client.getOperationMetrics(deploymentId);
  } catch (error) {
    console.error(
      `[Metrics] Failed to fetch operation metrics for deployment ${deploymentId}:`,
      error
    );
    return {};
  }
}
