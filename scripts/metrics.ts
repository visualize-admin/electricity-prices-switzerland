#!/usr/bin/env bun
/**
 * Queries metrics out of Sentry via CLI.
 *
 * Usage:
 *   yarn metrics list-releases
 *   yarn metrics operations --release <release-id>
 */

import { ArgumentParser } from "argparse";

import { getSentryClient } from "../src/lib/metrics/sentry-client";

async function listReleases() {
  const client = getSentryClient();

  if (!client.isConfigured()) {
    console.error("❌ SENTRY_AUTH_TOKEN not configured");
    console.error("   Please set SENTRY_AUTH_TOKEN in your .env file");
    process.exit(1);
  }

  console.log("📋 Fetching releases...\n");
  const releases = await client.listReleases();

  if (releases.length === 0) {
    console.log("No releases found");
    return;
  }

  console.log(`Found ${releases.length} release(s):\n`);
  releases.forEach((release, index) => {
    console.log(`  ${index + 1}. ${release}`);
  });
}

async function getMetrics(args: { release: string; operation?: string }) {
  const client = getSentryClient();

  if (!client.isConfigured()) {
    console.error("❌ SENTRY_AUTH_TOKEN not configured");
    console.error("   Please set SENTRY_AUTH_TOKEN in your .env file");
    process.exit(1);
  }

  const { release, operation } = args;

  console.log(`📊 Fetching metrics for release: ${release}\n`);

  const metrics = await client.getOperationMetrics(release);
  const operations = Object.keys(metrics);

  if (operations.length === 0) {
    console.log("No metrics found for this release");
    return;
  }

  console.log(`Found ${operations.length} operation(s):\n`);

  // Sort by request count descending
  const sortedOps = operations.sort(
    (a, b) => metrics[b].requestCount - metrics[a].requestCount
  );

  // Print table header
  console.log(
    "Operation".padEnd(30) +
      "Requests".padStart(10) +
      "Hits".padStart(10) +
      "Misses".padStart(10) +
      "Hit Rate".padStart(12) +
      "Avg Duration".padStart(15)
  );
  console.log("-".repeat(87));

  // Print each operation
  sortedOps.forEach((op) => {
    const m = metrics[op];
    const hitRate =
      m.requestCount > 0
        ? ((m.responseCacheHit / m.requestCount) * 100).toFixed(1) + "%"
        : "N/A";
    const avgDuration =
      m.requestCount > 0
        ? (m.totalDurationMs / m.requestCount).toFixed(1) + "ms"
        : "N/A";

    console.log(
      op.padEnd(30) +
        m.requestCount.toString().padStart(10) +
        m.responseCacheHit.toString().padStart(10) +
        m.responseCacheMiss.toString().padStart(10) +
        hitRate.padStart(12) +
        avgDuration.padStart(15)
    );
  });

  // Get resolver metrics if operation specified
  if (operation) {
    console.log(`\n📊 Fetching resolver metrics for operation: ${operation}\n`);

    const resolvers = await client.getResolverMetrics(release, operation);
    const resolverNames = Object.keys(resolvers);

    if (resolverNames.length === 0) {
      console.log("No resolver metrics found for this operation");
      return;
    }

    console.log(`Found ${resolverNames.length} resolver(s):\n`);

    // Sort by count descending
    const sortedResolvers = resolverNames.sort(
      (a, b) => resolvers[b].count - resolvers[a].count
    );

    // Print table header
    console.log(
      "Resolver".padEnd(40) + "Count".padStart(10) + "Avg Duration".padStart(15)
    );
    console.log("-".repeat(65));

    // Print each resolver
    sortedResolvers.forEach((resolver) => {
      const r = resolvers[resolver];
      const avgDuration =
        r.count > 0 ? (r.totalDurationMs / r.count).toFixed(2) + "ms" : "N/A";

      console.log(
        resolver.padEnd(40) +
          r.count.toString().padStart(10) +
          avgDuration.padStart(15)
      );
    });
  }
}

async function main() {
  const parser = new ArgumentParser({
    description: "Metrics CLI Tool",
  });

  const subparsers = parser.add_subparsers({
    title: "commands",
    dest: "command",
    required: true,
  });

  // Operations command
  const operationsParser = subparsers.add_parser("operations", {
    help: "Query GraphQL operation metrics from Sentry",
  });

  subparsers.add_parser("list-releases", {
    help: "List all releases with metrics",
  });

  operationsParser.add_argument("--release", {
    required: true,
    help: "Release ID to fetch metrics for",
  });

  try {
    const args = parser.parse_args();

    if (args.command === "operations") {
      await getMetrics({
        release: args.release,
        operation: args.operation,
      });
    } else if (args.command === "list-releases") {
      await listReleases();
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("unrecognized arguments")
    ) {
      // argparse already printed the error message
      process.exit(1);
    }
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
