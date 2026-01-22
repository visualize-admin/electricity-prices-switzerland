/* eslint-disable no-console */
import type { FullResult, Reporter } from "@playwright/test/reporter";

interface MetricsReporterOptions {
  metricsApiToken?: string;
  githubToken?: string;
  deploymentUrl?: string;
  enabled?: boolean;
}

interface OperationMetrics {
  requestCount: number;
  avgDurationMs: number;
  errorCount: number;
  errorRate: number;
  cacheHitRate: number;
  responseCacheHit: number;
  responseCacheMiss: number;
}

interface ResolverMetrics {
  count: number;
  avgDurationMs: number;
  errorCount: number;
}

interface MetricsResponse {
  deploymentId: string;
  collectedAt: string;
  operations: Record<string, OperationMetrics>;
  resolvers: Record<string, Record<string, ResolverMetrics>>;
}

const COMMENT_MARKER = "<!-- metrics-reporter -->";

export const createMetricsReporterOptions = (
  options: MetricsReporterOptions = {}
): MetricsReporterOptions => {
  return options;
};

/**
 * Playwright custom reporter for fetching and posting GraphQL metrics to GitHub PRs.
 *
 * Configuration:
 * - metricsApiToken: Bearer token for /api/admin/metrics
 * - githubToken: GitHub token for posting PR comments
 * - deploymentUrl: Base URL of deployment to fetch metrics from
 */
class MetricsReporter implements Reporter {
  private options: MetricsReporterOptions;

  constructor(options: MetricsReporterOptions = {}) {
    this.options = options;
  }

  async onEnd(result: FullResult) {
    // Only run if tests completed (not interrupted)
    if (result.status === "interrupted") {
      return;
    }

    if (this.options.enabled !== true) {
      console.log("[Metrics Reporter] Disabled, skipping metrics fetch");
      return;
    }

    console.log("\n[Metrics Reporter] Fetching server metrics...");

    try {
      await this.fetchAndPostMetrics();
    } catch (error) {
      // Fail gracefully - don't fail the test run
      console.warn("[Metrics Reporter] Failed to fetch/post metrics:", error);
    }
  }

  private async fetchAndPostMetrics() {
    const deploymentUrl =
      this.options.deploymentUrl ||
      process.env.VERCEL_URL ||
      process.env.PLAYWRIGHT_BASE_URL;

    if (!deploymentUrl) {
      console.warn(
        "[Metrics Reporter] No deployment URL available, skipping metrics fetch"
      );
      return;
    }

    // Ensure URL has protocol
    const baseUrl = deploymentUrl.startsWith("http")
      ? deploymentUrl
      : `https://${deploymentUrl}`;

    // Fetch metrics from API
    const metricsUrl = `${baseUrl}/api/admin/metrics`;
    const headers: Record<string, string> = {};

    // Add auth header (required in all environments)
    const metricsApiToken = this.options.metricsApiToken;
    if (metricsApiToken) {
      headers.Authorization = `Bearer ${metricsApiToken}`;
    }

    console.log(`[Metrics Reporter] Fetching from ${metricsUrl}`);

    const response = await fetch(metricsUrl, { headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch metrics: ${response.status} ${response.statusText}`
      );
    }

    const metrics: MetricsResponse = await response.json();

    // Format as markdown
    const markdown = this.formatMetricsAsMarkdown(metrics);

    // Log to console
    console.log("\n" + markdown);

    // Post to GitHub if in PR context
    const githubToken = this.options.githubToken || process.env.GITHUB_TOKEN;
    const prNumber = this.getPRNumber();

    if (prNumber && githubToken) {
      await this.postGitHubComment(prNumber, markdown, githubToken);
    } else if (!prNumber) {
      console.log(
        "[Metrics Reporter] Not a PR context, skipping GitHub comment"
      );
    } else if (!githubToken) {
      console.log(
        "[Metrics Reporter] No GitHub token available, skipping comment"
      );
    }
  }

  private formatMetricsAsMarkdown(metrics: MetricsResponse): string {
    const lines: string[] = [
      `${COMMENT_MARKER}`,
      "## 📊 Server Metrics for this PR",
      "",
      `**Deployment:** \`${metrics.deploymentId}\``,
      `**Collected:** ${new Date(metrics.collectedAt).toUTCString()}`,
      "",
    ];

    const operations = Object.entries(metrics.operations);

    if (operations.length === 0) {
      lines.push("_No GraphQL operations recorded during tests_");
      return lines.join("\n");
    }

    lines.push("### GraphQL Operations", "");
    lines.push(
      "| Operation | Requests | Avg Duration | Cache Hit Rate | Errors |"
    );
    lines.push(
      "| --------- | -------- | ------------ | -------------- | ------ |"
    );

    for (const [operationName, op] of operations) {
      const avgDuration = `${Math.round(op.avgDurationMs)}ms`;
      const cacheHitRate = `${Math.round(op.cacheHitRate * 100)}%`;
      const errors =
        op.errorCount > 0
          ? `${op.errorCount} (${Math.round(op.errorRate * 100)}%)`
          : "0";

      lines.push(
        `| ${operationName} | ${op.requestCount} | ${avgDuration} | ${cacheHitRate} | ${errors} |`
      );
    }

    // Add resolver breakdown in collapsible section
    const resolvers = Object.entries(metrics.resolvers);
    if (resolvers.length > 0) {
      lines.push("", "<details>");
      lines.push("<summary>Resolver breakdown</summary>", "");

      for (const [operationName, fields] of resolvers) {
        lines.push(`#### ${operationName}`, "");
        lines.push("| Resolver | Calls | Avg Duration | Errors |");
        lines.push("| -------- | ----- | ------------ | ------ |");

        for (const [fieldPath, resolver] of Object.entries(fields)) {
          const avgDuration = `${Math.round(resolver.avgDurationMs)}ms`;
          lines.push(
            `| ${fieldPath} | ${resolver.count} | ${avgDuration} | ${resolver.errorCount} |`
          );
        }

        lines.push("");
      }

      lines.push("</details>");
    }

    return lines.join("\n");
  }

  private getPRNumber(): string | null {
    // Try Vercel's PR ID first
    if (process.env.VERCEL_GIT_PULL_REQUEST_ID) {
      return process.env.VERCEL_GIT_PULL_REQUEST_ID;
    }

    // Try to extract from GITHUB_REF (format: refs/pull/:prNumber/merge)
    if (process.env.GITHUB_REF) {
      const match = process.env.GITHUB_REF.match(/refs\/pull\/(\d+)\//);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  private async postGitHubComment(
    prNumber: string,
    markdown: string,
    token: string
  ) {
    // Get repository info from GITHUB_REPOSITORY (format: owner/repo)
    const repo = process.env.GITHUB_REPOSITORY;
    if (!repo) {
      console.warn(
        "[Metrics Reporter] GITHUB_REPOSITORY not set, cannot post comment"
      );
      return;
    }

    const [owner, repoName] = repo.split("/");

    // Check if comment already exists
    const commentsUrl = `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`;

    const listResponse = await fetch(commentsUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to fetch comments: ${listResponse.statusText}`);
    }

    const comments = await listResponse.json();
    const existingComment = comments.find((c: { id: number; body?: string }) =>
      c.body?.includes(COMMENT_MARKER)
    );

    if (existingComment) {
      // Update existing comment
      console.log(
        `[Metrics Reporter] Updating existing comment ${existingComment.id}`
      );
      const updateUrl = `https://api.github.com/repos/${owner}/${repoName}/issues/comments/${existingComment.id}`;

      const updateResponse = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: markdown }),
      });

      if (!updateResponse.ok) {
        throw new Error(
          `Failed to update comment: ${updateResponse.statusText}`
        );
      }
    } else {
      // Create new comment
      console.log(`[Metrics Reporter] Creating new comment on PR #${prNumber}`);

      const createResponse = await fetch(commentsUrl, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: markdown }),
      });

      if (!createResponse.ok) {
        throw new Error(
          `Failed to create comment: ${createResponse.statusText}`
        );
      }
    }

    console.log(
      `[Metrics Reporter] Successfully posted metrics to PR #${prNumber}`
    );
  }
}

export default MetricsReporter;
