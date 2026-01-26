import serverEnv from "src/env/server";
import { SENTRY_DSN } from "src/lib/sentry/constants";

/**
 * Sentry Discover API client for querying GraphQL metrics stored as distributed traces.
 *
 * API Documentation:
 * - https://docs.sentry.io/api/discover/query-discover-events-in-table-format/
 * - https://docs.sentry.io/product/discover-queries/query-builder/
 */

/**
 * Parse Sentry DSN to extract organization, project IDs, and region
 * DSN format: https://{key}@o{org_id}.ingest.{region}.sentry.io/{project_id}
 */
function parseSentryDSN(dsn: string): {
  orgId: string;
  projectId: string;
  region: string;
  apiBase: string;
} {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.slice(1); // Remove leading slash

    // Extract region and org ID from hostname (e.g., o65222.ingest.us.sentry.io)
    const hostParts = url.hostname.split(".");
    const orgPart = hostParts[0]; // e.g., "o65222"
    const orgId = orgPart.startsWith("o") ? orgPart.slice(1) : orgPart;

    // Extract region (e.g., "us" from "o65222.ingest.us.sentry.io")
    const region = hostParts.length > 3 ? hostParts[2] : "";

    // Build API base URL with region
    const apiBase = region
      ? `https://${region}.sentry.io/api/0`
      : "https://sentry.io/api/0";

    return { orgId, projectId, region, apiBase };
  } catch (error) {
    throw new Error(`Failed to parse Sentry DSN: ${error}`);
  }
}

const { projectId: SENTRY_PROJECT_ID, apiBase: SENTRY_API_BASE } =
  parseSentryDSN(SENTRY_DSN);
const SENTRY_ORGANIZATION = "interactive-things"; // Organization slug

interface SentryEventsTimeseriesQuery {
  dataset: string;
  yAxis: string[];
  groupBy?: string[];
  query?: string;
  interval?: string;
  statsPeriod?: string;
  topEvents?: number;
  environment?: string;
}

interface SentryEventsTimeseriesResult {
  [groupKey: string]: {
    data: Array<{ time: number; count: number }>;
    meta?: {
      fields?: Record<string, string>;
      units?: Record<string, string | null>;
    };
  };
}

interface SentryEventsTimeseriesResponse {
  [key: string]: SentryEventsTimeseriesResult;
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
   * Query Sentry Events/Discover API for spans
   */
  private async queryEvents(query: {
    dataset: string;
    field: string[];
    query?: string;
    statsPeriod?: string;
    sort?: string;
    per_page?: number;
    environment?: string;
  }): Promise<{ data: Array<Record<string, $IntentionalAny>> }> {
    if (!this.authToken) {
      throw new Error("SENTRY_AUTH_TOKEN not configured");
    }

    const url = new URL(
      `${SENTRY_API_BASE}/organizations/${SENTRY_ORGANIZATION}/events/`
    );

    // Add query parameters
    url.searchParams.set("project", SENTRY_PROJECT_ID);
    url.searchParams.set("dataset", query.dataset);
    url.searchParams.set("statsPeriod", query.statsPeriod || "24h");

    query.field.forEach((field) => {
      url.searchParams.append("field", field);
    });

    if (query.query) {
      url.searchParams.set("query", query.query);
    }

    if (query.sort) {
      url.searchParams.set("sort", query.sort);
    }

    if (query.per_page) {
      url.searchParams.set("per_page", query.per_page.toString());
    }

    url.searchParams.set("sampling", "NORMAL");

    if (query.environment) {
      url.searchParams.set("environment", query.environment);
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
   * Query Sentry Events Timeseries API for span metrics
   */
  private async queryEventsTimeseries(
    query: SentryEventsTimeseriesQuery
  ): Promise<SentryEventsTimeseriesResponse> {
    if (!this.authToken) {
      throw new Error("SENTRY_AUTH_TOKEN not configured");
    }

    const url = new URL(
      `${SENTRY_API_BASE}/organizations/${SENTRY_ORGANIZATION}/events-timeseries/`
    );

    // Add query parameters
    url.searchParams.set("project", SENTRY_PROJECT_ID);
    url.searchParams.set("dataset", query.dataset);
    url.searchParams.set("statsPeriod", query.statsPeriod || "24h");
    url.searchParams.set("interval", query.interval || "1h");

    query.yAxis.forEach((axis) => {
      url.searchParams.append("yAxis", axis);
    });

    if (query.groupBy) {
      query.groupBy.forEach((group) => {
        url.searchParams.append("groupBy", group);
      });
    }

    if (query.query) {
      url.searchParams.set("query", query.query);
    }

    if (query.topEvents !== undefined) {
      url.searchParams.set("topEvents", query.topEvents.toString());
    }

    if (query.environment) {
      url.searchParams.set("environment", query.environment);
    }

    // Add default parameters that Sentry UI uses
    url.searchParams.set("partial", "1");
    url.searchParams.set("excludeOther", "0");

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
   * Fetch operation-level metrics for a specific release
   * Queries spans with cache_status attribute (HIT or MISS)
   */
  async getOperationMetrics(release: string): Promise<
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
      // Query using Events/Discover API with spans dataset (like CSV export)
      const response = await this.queryEvents({
        dataset: "spans",
        field: [
          "span.description",
          "cache_status",
          "count(span.duration)",
          "sum(span.duration)",
        ],
        query: `release:${release} has:cache_status`,
        statsPeriod: "24h",
        per_page: 50,
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

      // Aggregate rows by operation name
      for (const row of response.data) {
        const operationName = row["span.description"] as string;
        const cacheStatus = row.cache_status as string;
        const count = (row["count(span.duration)"] as number) || 0;
        const durationMs = (row["sum(span.duration)"] as number) || 0;

        if (!operationName) continue;

        // Initialize operation if not exists
        if (!result[operationName]) {
          result[operationName] = {
            requestCount: 0,
            totalDurationMs: 0,
            errorCount: 0,
            responseCacheHit: 0,
            responseCacheMiss: 0,
          };
        }

        // Add to totals
        result[operationName].requestCount += count;
        result[operationName].totalDurationMs += durationMs;

        // Categorize by cache status
        if (cacheStatus === "HIT") {
          result[operationName].responseCacheHit += count;
        } else if (cacheStatus === "MISS") {
          result[operationName].responseCacheMiss += count;
        }
      }

      return result;
    } catch (error) {
      console.error(
        `[Sentry Client] Failed to fetch operation metrics for release ${release}:`,
        error
      );
      return {};
    }
  }

  /**
   * Fetch resolver-level metrics for a specific operation
   */
  async getResolverMetrics(
    release: string,
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
      const response = await this.queryEvents({
        dataset: "spans",
        field: [
          "span.description",
          "count(span.duration)",
          "sum(span.duration)",
        ],
        query: `release:${release} span.description:${operationName} span.op:graphql.resolver`,
        statsPeriod: "24h",
        per_page: 50,
      });

      const result: Record<
        string,
        {
          count: number;
          totalDurationMs: number;
          errorCount: number;
        }
      > = {};

      for (const row of response.data) {
        const fieldPath = row["span.description"] as string;
        if (!fieldPath) continue;

        result[fieldPath] = {
          count: (row["count(span.duration)"] as number) || 0,
          totalDurationMs: (row["sum(span.duration)"] as number) || 0,
          errorCount: 0,
        };
      }

      return result;
    } catch (error) {
      console.error(
        `[Sentry Client] Failed to fetch resolver metrics for release ${release}/${operationName}:`,
        error
      );
      return {};
    }
  }

  /**
   * List all unique releases that have metrics in Sentry
   */
  async listReleases(): Promise<string[]> {
    try {
      // Use the Events/Discover API to get rows of data (like the CSV export)
      const response = await this.queryEvents({
        dataset: "spans",
        field: ["release", "count(span.duration)"],
        query: "",
        statsPeriod: "90d",
        per_page: 100,
      });

      // Extract unique releases from data rows
      const releases = response.data
        .map((row) => row.release as string | null)
        .filter(
          (release): release is string => release !== null && release !== ""
        );

      return [...new Set(releases)];
    } catch (error) {
      console.error("[Sentry Client] Failed to list releases:", error);
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
