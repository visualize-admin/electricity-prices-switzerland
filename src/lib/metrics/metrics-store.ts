import { getDeploymentId } from "./deployment-id";
import { getRedisClient } from "./redis-client";

const TTL_SECONDS = 24 * 60 * 60; // 24 hours

export interface OperationMetrics {
  requestCount: number;
  totalDurationMs: number;
  errorCount: number;
  responseCacheHit: number;
  responseCacheMiss: number;
}

export interface ResolverMetrics {
  count: number;
  totalDurationMs: number;
  errorCount: number;
}

/**
 * Increments operation-level metrics in Redis
 */
export async function incrementOperationMetrics(
  operationName: string,
  metrics: Partial<OperationMetrics>
): Promise<void> {
  const client = getRedisClient();
  const key = getOperationKey(operationName);

  try {
    await client.hincrby(key, metrics as Record<string, number>);
    await client.expire(key, TTL_SECONDS);
  } catch (error) {
    console.error(`[Metrics] Failed to increment operation metrics for ${operationName}:`, error);
  }
}

/**
 * Increments resolver-level metrics in Redis
 */
export async function incrementResolverMetrics(
  operationName: string,
  fieldPath: string,
  metrics: Partial<ResolverMetrics>
): Promise<void> {
  const client = getRedisClient();
  const truncatedPath = truncateFieldPath(fieldPath);
  const key = getResolverKey(operationName, truncatedPath);

  try {
    await client.hincrby(key, metrics as Record<string, number>);
    await client.expire(key, TTL_SECONDS);
  } catch (error) {
    console.error(
      `[Metrics] Failed to increment resolver metrics for ${operationName}.${fieldPath}:`,
      error
    );
  }
}

/**
 * Fetches all operation metrics for the current deployment
 */
export async function getOperationMetrics(): Promise<Record<string, OperationMetrics>> {
  const client = getRedisClient();
  const deploymentId = getDeploymentId();
  const pattern = `metrics:${deploymentId}:operations:*`;

  try {
    const keys = await client.keys(pattern);
    const result: Record<string, OperationMetrics> = {};

    for (const key of keys) {
      const data = await client.hgetall(key);
      if (data && Object.keys(data).length > 0) {
        const operationName = key.split(":").pop()!;
        result[operationName] = data as unknown as OperationMetrics;
      }
    }

    return result;
  } catch (error) {
    console.error("[Metrics] Failed to fetch operation metrics:", error);
    return {};
  }
}

/**
 * Fetches all resolver metrics for the current deployment
 */
export async function getResolverMetrics(): Promise<
  Record<string, Record<string, ResolverMetrics>>
> {
  const client = getRedisClient();
  const deploymentId = getDeploymentId();
  const pattern = `metrics:${deploymentId}:resolvers:*`;

  try {
    const keys = await client.keys(pattern);
    const result: Record<string, Record<string, ResolverMetrics>> = {};

    for (const key of keys) {
      const data = await client.hgetall(key);
      if (data && Object.keys(data).length > 0) {
        // Key format: metrics:{deploymentId}:resolvers:{operationName}:{fieldPath}
        const parts = key.split(":");
        const operationName = parts[3];
        const fieldPath = parts.slice(4).join(":");

        if (!result[operationName]) {
          result[operationName] = {};
        }
        result[operationName][fieldPath] = data as unknown as ResolverMetrics;
      }
    }

    return result;
  } catch (error) {
    console.error("[Metrics] Failed to fetch resolver metrics:", error);
    return {};
  }
}

/**
 * Clears all metrics for the current deployment
 */
export async function clearMetrics(): Promise<boolean> {
  const client = getRedisClient();
  const deploymentId = getDeploymentId();
  const pattern = `metrics:${deploymentId}:*`;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    console.info(`[Metrics] Cleared ${keys.length} metric keys`);
    return true;
  } catch (error) {
    console.error("[Metrics] Failed to clear metrics:", error);
    return false;
  }
}

/**
 * Lists all unique deployment IDs that have metrics stored in Redis
 */
export async function listDeploymentIds(): Promise<string[]> {
  const client = getRedisClient();
  const pattern = "metrics:*:operations:*";

  try {
    const keys = await client.keys(pattern);
    const deploymentIds = new Set<string>();

    for (const key of keys) {
      // Key format: metrics:{deploymentId}:operations:{operationName}
      const parts = key.split(":");
      if (parts.length >= 2) {
        deploymentIds.add(parts[1]);
      }
    }

    return Array.from(deploymentIds);
  } catch (error) {
    console.error("[Metrics] Failed to list deployment IDs:", error);
    return [];
  }
}

/**
 * Fetches all operation metrics for a specific deployment ID
 */
export async function getOperationMetricsByDeploymentId(
  deploymentId: string
): Promise<Record<string, OperationMetrics>> {
  const client = getRedisClient();
  const pattern = `metrics:${deploymentId}:operations:*`;

  try {
    const keys = await client.keys(pattern);
    const result: Record<string, OperationMetrics> = {};

    for (const key of keys) {
      const data = await client.hgetall(key);
      if (data && Object.keys(data).length > 0) {
        const operationName = key.split(":").pop()!;
        result[operationName] = data as unknown as OperationMetrics;
      }
    }

    return result;
  } catch (error) {
    console.error(`[Metrics] Failed to fetch operation metrics for deployment ${deploymentId}:`, error);
    return {};
  }
}

// Helper functions

function getOperationKey(operationName: string): string {
  const deploymentId = getDeploymentId();
  return `metrics:${deploymentId}:operations:${operationName}`;
}

function getResolverKey(operationName: string, fieldPath: string): string {
  const deploymentId = getDeploymentId();
  return `metrics:${deploymentId}:resolvers:${operationName}:${fieldPath}`;
}

function truncateFieldPath(fieldPath: string): string {
  const parts = fieldPath.split(".");
  if (parts.length <= 5) {
    return fieldPath;
  }
  return parts.slice(0, 5).join(".") + "...";
}
