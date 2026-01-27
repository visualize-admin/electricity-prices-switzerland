import * as Sentry from "@sentry/nextjs";

import { getSentryClient } from "./sentry-client";
import type { RawOperationMetrics, RawResolverMetrics } from "./types";

/**
 * Gets the current release identifier for metrics
 * This should match the release set in Sentry configuration
 */
function getCurrentRelease(): string {
  // Get the release from Sentry's current scope
  const client = Sentry.getClient();
  const release = client?.getOptions().release;

  if (release) {
    return release;
  }

  // Fallback if Sentry hasn't been initialized yet
  console.warn("[Metrics] No Sentry release found, using fallback");
  return "unknown";
}

/**
 * Fetches all operation metrics for the current release from Sentry
 */
export async function getOperationMetrics(): Promise<
  Record<string, RawOperationMetrics>
> {
  const client = getSentryClient();
  const release = getCurrentRelease();

  try {
    return await client.getOperationMetrics(release);
  } catch (error) {
    console.error("[Metrics] Failed to fetch operation metrics:", error);
    return {};
  }
}

/**
 * Fetches all resolver metrics for the current release from Sentry
 */
export async function getResolverMetrics(): Promise<
  Record<string, Record<string, RawResolverMetrics>>
> {
  const client = getSentryClient();
  const release = getCurrentRelease();

  try {
    // First, get all operations to know which ones to query for resolvers
    const operations = await client.getOperationMetrics(release);
    const result: Record<string, Record<string, RawResolverMetrics>> = {};

    // Fetch resolver metrics for each operation
    for (const operationName of Object.keys(operations)) {
      const resolvers = await client.getResolverMetrics(release, operationName);
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
 * Clears all metrics for the current release (no-op for Sentry)
 */
export async function clearMetrics(): Promise<boolean> {
  // No-op: Sentry data cannot be cleared via API
  // This function is kept for backward compatibility
  console.info("[Metrics] Clear metrics not supported with Sentry backend");
  return false;
}

/**
 * Lists all unique releases that have metrics stored in Sentry
 */
export async function listReleases(): Promise<string[]> {
  const client = getSentryClient();

  try {
    return await client.listReleases();
  } catch (error) {
    console.error("[Metrics] Failed to list releases:", error);
    return [];
  }
}

/**
 * Fetches all operation metrics for a specific release from Sentry
 */
export async function getOperationMetricsByRelease(
  release: string
): Promise<Record<string, RawOperationMetrics>> {
  const client = getSentryClient();

  try {
    return await client.getOperationMetrics(release);
  } catch (error) {
    console.error(
      `[Metrics] Failed to fetch operation metrics for release ${release}:`,
      error
    );
    return {};
  }
}
