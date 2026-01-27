/* eslint-disable no-console */
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

import { Octokit } from "@octokit/rest";

import { calculateSummaryStats, compareMetrics } from "./metrics-comparator";
import { formatTable } from "./table-formatter";
import type { MetricsResponse } from "./types";

import type { OperationComparison } from "./metrics-comparator";
import type { FullResult, Reporter } from "@playwright/test/reporter";

interface MetricsReporterOptions {
  githubToken?: string;
  deploymentUrl?: string;
  enabled?: boolean;
  artifactPath?: string;
  baselineBranch?: string;
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
 * - githubToken: GitHub token for posting PR comments
 * - deploymentUrl: Base URL of deployment to fetch metrics from
 *
 * Authentication:
 * - Uses ADMIN_API_TOKEN env variable as Bearer token
 * - Falls back to BASIC_AUTH_CREDENTIALS (encoded as Basic auth)
 */
class MetricsReporter implements Reporter {
  private options: MetricsReporterOptions;
  private env: {
    adminApiToken: string | undefined;
    vercelGitPullRequestId: string | undefined;
    githubRef: string | undefined;
    githubRepository: string | undefined;
    githubToken: string | undefined;
    vercelUrl: string | undefined;
    playwrightBaseUrl: string | undefined;
    repoOwner: string | undefined;
    repoName: string | undefined;
  };

  constructor(options: MetricsReporterOptions = {}) {
    this.options = options;

    // Extract all environment variables once
    this.env = {
      adminApiToken: process.env.ADMIN_API_TOKEN,
      vercelGitPullRequestId: process.env.VERCEL_GIT_PULL_REQUEST_ID,
      githubRef: process.env.GITHUB_REF,
      githubRepository: process.env.GITHUB_REPOSITORY,
      githubToken: process.env.GITHUB_TOKEN,
      vercelUrl: process.env.VERCEL_URL,
      playwrightBaseUrl: process.env.PLAYWRIGHT_BASE_URL,
      repoOwner: process.env.GITHUB_REPOSITORY?.split("/")[0],
      repoName: process.env.GITHUB_REPOSITORY?.split("/")[1],
    };

    if (!this.env.adminApiToken) {
      console.warn(
        "[Metrics Reporter] No ADMIN_API_TOKEN provided, disabling reporter"
      );
      this.options.enabled = false;
    }
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

  private saveMetricsArtifact(metrics: MetricsResponse) {
    if (!this.options.artifactPath) {
      return;
    }

    const artifactPath = this.options.artifactPath;
    const artifactDir = path.dirname(artifactPath);

    // Ensure directory exists
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }

    // Write metrics as pretty-printed JSON
    fs.writeFileSync(artifactPath, JSON.stringify(metrics, null, 2), "utf-8");
    console.log(`[Metrics Reporter] Saved metrics artifact to ${artifactPath}`);
  }

  private async fetchBaseline(
    octokit: Octokit,
    owner: string,
    repo: string,
    branch: string,
    artifactName: string
  ): Promise<MetricsResponse | null> {
    try {
      console.log(
        `[Metrics Reporter] Fetching baseline from ${branch} branch...`
      );

      // 1. Get latest successful workflow run on main branch
      const workflowRuns = await octokit.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        branch,
        status: "success",
        per_page: 1,
      });

      if (workflowRuns.data.workflow_runs.length === 0) {
        console.warn(
          `[Metrics Reporter] No successful workflow runs found on ${branch} branch`
        );
        return null;
      }

      const latestRun = workflowRuns.data.workflow_runs[0];
      console.log(
        `[Metrics Reporter] Found latest successful run: ${latestRun.id}`
      );

      // 2. List artifacts from this run
      const artifacts = await octokit.actions.listWorkflowRunArtifacts({
        owner,
        repo,
        run_id: latestRun.id,
      });

      const metricsArtifact = artifacts.data.artifacts.find(
        (a) => a.name === artifactName
      );

      if (!metricsArtifact) {
        console.warn(
          `[Metrics Reporter] Artifact '${artifactName}' not found in run ${latestRun.id}`
        );
        return null;
      }

      console.log(
        `[Metrics Reporter] Found artifact: ${metricsArtifact.name} (ID: ${metricsArtifact.id})`
      );

      // 3. Download artifact
      const download = await octokit.actions.downloadArtifact({
        owner,
        repo,
        artifact_id: metricsArtifact.id,
        archive_format: "zip",
      });

      // 4. Save ZIP to temp directory
      const tmpDir = "/tmp/claude";
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const zipPath = path.join(tmpDir, "baseline-metrics.zip");
      const extractDir = path.join(tmpDir, "baseline");

      // Write the downloaded artifact (which is a buffer)
      fs.writeFileSync(zipPath, Buffer.from(download.data as ArrayBuffer));
      console.log(`[Metrics Reporter] Downloaded artifact to ${zipPath}`);

      // 5. Extract ZIP
      if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true });
      }
      fs.mkdirSync(extractDir, { recursive: true });

      execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, {
        stdio: "ignore",
      });
      console.log(`[Metrics Reporter] Extracted artifact to ${extractDir}`);

      // 6. Read and parse JSON
      const jsonPath = path.join(extractDir, "graphql-metrics.json");

      if (!fs.existsSync(jsonPath)) {
        console.warn(
          `[Metrics Reporter] graphql-metrics.json not found in artifact`
        );
        return null;
      }

      const jsonContent = fs.readFileSync(jsonPath, "utf-8");
      const metrics: MetricsResponse = JSON.parse(jsonContent);

      console.log(
        `[Metrics Reporter] Successfully loaded baseline (release: ${metrics.release})`
      );

      // Cleanup
      fs.rmSync(zipPath);
      fs.rmSync(extractDir, { recursive: true });

      return metrics;
    } catch (error) {
      console.warn(
        `[Metrics Reporter] Failed to fetch baseline:`,
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }

  private isPRContext(): boolean {
    return !!(
      this.env.vercelGitPullRequestId ||
      (this.env.githubRef && this.env.githubRef.includes("/pull/"))
    );
  }

  private getRepoOwner(): string | null {
    return this.env.repoOwner ?? null;
  }

  private getRepoName(): string | null {
    return this.env.repoName ?? null;
  }

  private getArtifactName(): string | null {
    if (!this.options.artifactPath) {
      return null;
    }
    // Extract filename without extension from path
    // e.g., "test-results/graphql-metrics.json" -> "graphql-metrics"
    const filename = path.basename(this.options.artifactPath);
    return filename.replace(/\.[^/.]+$/, "");
  }

  private async fetchAndPostMetrics() {
    const deploymentUrl =
      this.options.deploymentUrl ||
      this.env.vercelUrl ||
      this.env.playwrightBaseUrl;

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
    if (this.env.adminApiToken) {
      headers.Authorization = `Bearer ${this.env.adminApiToken}`;
    }

    console.log(`[Metrics Reporter] Fetching from ${metricsUrl}`);

    const response = await fetch(metricsUrl, { headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch metrics: ${response.status} ${response.statusText}`
      );
    }

    const metrics: MetricsResponse = await response.json();

    // Save artifact
    this.saveMetricsArtifact(metrics);

    // Fetch baseline (only in PR context)
    let baseline: MetricsResponse | null = null;
    let comparisons: OperationComparison[] | null = null;
    const artifactName = this.getArtifactName();

    if (this.isPRContext() && artifactName) {
      const owner = this.getRepoOwner();
      const repo = this.getRepoName();
      const githubToken = this.options.githubToken || this.env.githubToken;

      if (owner && repo && githubToken) {
        try {
          const octokit = new Octokit({ auth: githubToken });
          baseline = await this.fetchBaseline(
            octokit,
            owner,
            repo,
            this.options.baselineBranch || "main",
            artifactName
          );

          if (baseline) {
            comparisons = compareMetrics(metrics, baseline);
          }
        } catch (error) {
          console.warn(
            "[Metrics Reporter] Failed to fetch baseline:",
            error instanceof Error ? error.message : error
          );
          // Continue without comparison (graceful degradation)
        }
      }
    }

    // Format as markdown with comparison
    const markdown = this.formatMetricsAsMarkdown(
      metrics,
      comparisons,
      baseline?.release
    );

    // Log to console
    console.log("\n" + markdown);

    // Post to GitHub if in PR context
    const githubToken = this.options.githubToken || this.env.githubToken;
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

  private formatMetricsAsMarkdown(
    metrics: MetricsResponse,
    comparisons?: OperationComparison[] | null,
    baselineRelease?: string | null
  ): string {
    const lines: string[] = [
      `${COMMENT_MARKER}`,
      "## 📊 Server Metrics for this PR",
      "",
      `**Release:** \`${metrics.release}\``,
      `**Collected:** ${new Date(metrics.collectedAt).toUTCString()}`,
    ];

    // Add baseline info if available
    if (baselineRelease && comparisons && comparisons.length > 0) {
      lines.push(
        `**Baseline:** \`${baselineRelease}\` (${
          comparisons[0].baseline ? "main" : "none"
        } branch)`
      );

      // Calculate and show summary stats
      const stats = calculateSummaryStats(comparisons);

      if (
        stats.avgDurationChange !== null ||
        stats.avgCacheHitRateChange !== null
      ) {
        lines.push("", "### Summary");

        if (stats.avgDurationChange !== null) {
          const change = stats.avgDurationChange;
          const indicator = change < 0 ? "🟢" : change > 0 ? "🔴" : "⚪";
          const direction =
            change < 0 ? "improved" : change > 0 ? "regressed" : "unchanged";
          lines.push(
            `${indicator} Performance ${direction}: Average duration ${
              change > 0 ? "+" : ""
            }${change.toFixed(1)}%`
          );
        }

        if (stats.avgCacheHitRateChange !== null) {
          const change = stats.avgCacheHitRateChange;
          const indicator = change > 0 ? "🟢" : change < 0 ? "🔴" : "⚪";
          const direction =
            change > 0 ? "improved" : change < 0 ? "decreased" : "unchanged";
          lines.push(
            `${indicator} Cache efficiency ${direction}: Hit rate ${
              change > 0 ? "+" : ""
            }${change.toFixed(1)}%`
          );
        }
      }
    } else if (comparisons === null) {
      lines.push(
        "",
        "ℹ️ **Baseline not available.** Will be available after merge to main."
      );
    }

    lines.push("");

    const operations = Object.entries(metrics.operations);

    if (operations.length === 0) {
      lines.push("_No GraphQL operations recorded during tests_");
      return lines.join("\n");
    }

    lines.push("### GraphQL Operations", "");

    // Format table based on whether we have comparisons
    if (comparisons && comparisons.length > 0) {
      // Enhanced table with deltas
      const tableLines = formatTable(comparisons, [
        {
          name: "Operation",
          format: (comp) =>
            comp.isNew ? `${comp.operationName} 🆕` : comp.operationName,
        },
        {
          name: "Requests",
          format: (comp) => comp.current.requestCount.toString(),
        },
        {
          name: "Δ",
          format: (comp) => this.formatDelta(comp.deltas.requestCount),
        },
        {
          name: "Avg Duration",
          format: (comp) => `${Math.round(comp.current.avgDurationMs)}ms`,
        },
        {
          name: "Δ",
          format: (comp) => this.formatDelta(comp.deltas.avgDurationMs),
        },
        {
          name: "Cache Hit Rate",
          format: (comp) => `${Math.round(comp.current.cacheHitRate * 100)}%`,
        },
        {
          name: "Δ",
          format: (comp) => this.formatDelta(comp.deltas.cacheHitRate),
        },
        {
          name: "Errors",
          format: (comp) =>
            comp.current.errorCount > 0
              ? `${comp.current.errorCount} (${Math.round(
                  comp.current.errorRate * 100
                )}%)`
              : "0",
        },
        {
          name: "Δ",
          format: (comp) => this.formatDelta(comp.deltas.errorRate),
        },
      ]);
      lines.push(...tableLines);
    } else {
      // Simple table without deltas
      const tableLines = formatTable(operations, [
        { name: "Operation", format: ([operationName]) => operationName },
        { name: "Requests", format: ([, op]) => op.requestCount.toString() },
        {
          name: "Avg Duration",
          format: ([, op]) => `${Math.round(op.avgDurationMs)}ms`,
        },
        {
          name: "Cache Hit Rate",
          format: ([, op]) => `${Math.round(op.cacheHitRate * 100)}%`,
        },
        {
          name: "Errors",
          format: ([, op]) =>
            op.errorCount > 0
              ? `${op.errorCount} (${Math.round(op.errorRate * 100)}%)`
              : "0",
        },
      ]);
      lines.push(...tableLines);
    }

    // Add resolver breakdown in collapsible section
    const resolvers = Object.entries(metrics.resolvers);
    if (resolvers.length > 0) {
      lines.push("", "<details>");
      lines.push("<summary>Resolver breakdown</summary>", "");

      for (const [operationName, fields] of resolvers) {
        lines.push(`#### ${operationName}`, "");

        const fieldEntries = Object.entries(fields);
        const tableLines = formatTable(fieldEntries, [
          { name: "Resolver", format: ([fieldPath]) => fieldPath },
          {
            name: "Calls",
            format: ([, resolver]) => resolver.count.toString(),
          },
          {
            name: "Avg Duration",
            format: ([, resolver]) => `${Math.round(resolver.avgDurationMs)}ms`,
          },
          {
            name: "Errors",
            format: ([, resolver]) => resolver.errorCount.toString(),
          },
        ]);
        lines.push(...tableLines);

        lines.push("");
      }

      lines.push("</details>");
    }

    return lines.join("\n");
  }

  private formatDelta(delta: {
    percentChange: number | null;
    isImprovement: boolean | null;
  }): string {
    if (delta.percentChange === null) {
      return "-";
    }

    const absChange = Math.abs(delta.percentChange);
    const sign = delta.percentChange > 0 ? "+" : "";
    let indicator = "";

    // Add improvement/regression indicators for metrics where direction matters
    if (delta.isImprovement !== null && absChange >= 1) {
      if (delta.isImprovement) {
        indicator = " ⬇"; // Improvement
      } else {
        indicator = " ⬆"; // Regression
      }
    }

    return `${sign}${delta.percentChange.toFixed(1)}%${indicator}`;
  }

  private getPRNumber(): string | null {
    // Try Vercel's PR ID first
    if (this.env.vercelGitPullRequestId) {
      return this.env.vercelGitPullRequestId;
    }

    // Try to extract from GITHUB_REF (format: refs/pull/:prNumber/merge)
    if (this.env.githubRef) {
      const match = this.env.githubRef.match(/refs\/pull\/(\d+)\//);
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
    // Get repository info from env
    if (!this.env.repoOwner || !this.env.repoName) {
      console.warn(
        "[Metrics Reporter] GITHUB_REPOSITORY not set, cannot post comment"
      );
      return;
    }

    const owner = this.env.repoOwner;
    const repoName = this.env.repoName;
    const octokit = new Octokit({ auth: token });

    try {
      // Check if comment already exists
      const { data: comments } = await octokit.rest.issues.listComments({
        owner,
        repo: repoName,
        issue_number: parseInt(prNumber, 10),
      });

      const existingComment = comments.find((comment) =>
        comment.body?.includes(COMMENT_MARKER)
      );

      if (existingComment) {
        // Update existing comment
        console.log(
          `[Metrics Reporter] Updating existing comment ${existingComment.id}`
        );

        await octokit.rest.issues.updateComment({
          owner,
          repo: repoName,
          comment_id: existingComment.id,
          body: markdown,
        });
      } else {
        // Create new comment
        console.log(
          `[Metrics Reporter] Creating new comment on PR #${prNumber}`
        );

        await octokit.rest.issues.createComment({
          owner,
          repo: repoName,
          issue_number: parseInt(prNumber, 10),
          body: markdown,
        });
      }

      console.log(
        `[Metrics Reporter] Successfully posted metrics to PR #${prNumber}`
      );
    } catch (error) {
      throw new Error(
        `Failed to post GitHub comment: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

export default MetricsReporter;
