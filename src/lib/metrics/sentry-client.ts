import serverEnv from "src/env/server";

/**
 * Sentry Stats API client for querying GraphQL metrics stored as distributed traces.
 *
 * API Documentation: https://docs.sentry.io/api/events/retrieve-event-counts-for-an-organization/
 */

const SENTRY_API_BASE = "https://sentry.io/api/0";
const SENTRY_ORGANIZATION = "interactive-things";
const SENTRY_PROJECT = "elcom-strompreise";

interface SentryStatsQuery {
  field: string[];
  groupBy?: string[];
  query?: string;
  interval?: string;
  statsPeriod?: string;
}

interface SentryStatsGroup {
  by: Record<string, string>;
  totals: Record<string, number>;
}

interface SentryStatsResponse {
  start: string;
  end: string;
  intervals: string[];
  groups: SentryStatsGroup[];
}

/**
 * Client for querying Sentry Stats API
 */
export class SentryMetricsClient {
  private authToken: string | null;

  constructor() {
    this.authToken = serverEnv.SENTRY_AUTH_TOKEN ?? null;
  }

  /**
   * Check if the client is configured with an auth token
   */
  isConfigured(): boolean {
    return this.authToken !== null;
  }

  /**
   * Query Sentry Stats API
   */
  private async queryStats(query: SentryStatsQuery): Promise<SentryStatsResponse> {
    if (!this.authToken) {
      throw new Error("SENTRY_AUTH_TOKEN not configured");
    }

    const url = new URL(
      `${SENTRY_API_BASE}/organizations/${SENTRY_ORGANIZATION}/stats_v2/`
    );

    // Add query parameters
    url.searchParams.set("project", SENTRY_PROJECT);
    url.searchParams.set("category", "transaction");
    url.searchParams.set("statsPeriod", query.statsPeriod || "24h");

    query.field.forEach((field) => {
      url.searchParams.append("field", field);
    });

    if (query.groupBy) {
      query.groupBy.forEach((group) => {
        url.searchParams.append("groupBy", group);
      });
    }

    if (query.query) {
      url.searchParams.set("query", query.query);
    }

    if (query.interval) {
      url.searchParams.set("interval", query.interval);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Sentry API request failed: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch operation-level metrics for a specific deployment
   */
  async getOperationMetrics(deploymentId: string): Promise<
    Record<
      string,
      {
        requestCount: number;
        totalDurationMs: number;
        errorCount: number;
        responseCacheHit: number;
        responseCacheMiss: number;
      }
    >
  > {
    try {
      const response = await this.queryStats({
        field: [
          "count()",
          "sum(transaction.duration)",
          "sum(measurements.cache_hit)",
          "sum(measurements.cache_miss)",
        ],
        groupBy: ["transaction"],
        query: `deployment:${deploymentId} transaction.op:graphql.operation`,
        statsPeriod: "24h",
      });

      const result: Record<
        string,
        {
          requestCount: number;
          totalDurationMs: number;
          errorCount: number;
          responseCacheHit: number;
          responseCacheMiss: number;
        }
      > = {};

      for (const group of response.groups) {
        const operationName = group.by.transaction;
        if (!operationName) continue;

        result[operationName] = {
          requestCount: group.totals["count()"] || 0,
          // Convert duration from seconds to milliseconds
          totalDurationMs: (group.totals["sum(transaction.duration)"] || 0) * 1000,
          errorCount: 0, // Will be populated separately if needed
          responseCacheHit: group.totals["sum(measurements.cache_hit)"] || 0,
          responseCacheMiss: group.totals["sum(measurements.cache_miss)"] || 0,
        };
      }

      return result;
    } catch (error) {
      console.error(
        `[Sentry Client] Failed to fetch operation metrics for ${deploymentId}:`,
        error
      );
      return {};
    }
  }

  /**
   * Fetch resolver-level metrics for a specific operation
   */
  async getResolverMetrics(
    deploymentId: string,
    operationName: string
  ): Promise<
    Record<
      string,
      {
        count: number;
        totalDurationMs: number;
        errorCount: number;
      }
    >
  > {
    try {
      const response = await this.queryStats({
        field: ["count()", "sum(span.duration)"],
        groupBy: ["span.description"],
        query: `deployment:${deploymentId} transaction:${operationName} span.op:graphql.resolver`,
        statsPeriod: "24h",
      });

      const result: Record<
        string,
        {
          count: number;
          totalDurationMs: number;
          errorCount: number;
        }
      > = {};

      for (const group of response.groups) {
        const fieldPath = group.by["span.description"];
        if (!fieldPath) continue;

        result[fieldPath] = {
          count: group.totals["count()"] || 0,
          // Convert duration from seconds to milliseconds
          totalDurationMs: (group.totals["sum(span.duration)"] || 0) * 1000,
          errorCount: 0, // Will be populated separately if needed
        };
      }

      return result;
    } catch (error) {
      console.error(
        `[Sentry Client] Failed to fetch resolver metrics for ${deploymentId}/${operationName}:`,
        error
      );
      return {};
    }
  }

  /**
   * List all unique deployment IDs that have metrics in Sentry
   */
  async listDeploymentIds(): Promise<string[]> {
    try {
      const response = await this.queryStats({
        field: ["count()"],
        groupBy: ["deployment"],
        query: "transaction.op:graphql.operation",
        statsPeriod: "24h",
      });

      const deploymentIds = response.groups
        .map((group) => group.by.deployment)
        .filter((id): id is string => !!id);

      return deploymentIds;
    } catch (error) {
      console.error("[Sentry Client] Failed to list deployment IDs:", error);
      return [];
    }
  }
}

// Singleton instance
let sentryClientInstance: SentryMetricsClient | null = null;

/**
 * Get or create the Sentry metrics client singleton
 */
export function getSentryClient(): SentryMetricsClient {
  if (!sentryClientInstance) {
    sentryClientInstance = new SentryMetricsClient();
  }
  return sentryClientInstance;
}
