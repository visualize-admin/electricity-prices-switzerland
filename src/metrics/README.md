# GraphQL Metrics Reporting

Self-contained GraphQL metrics reporting system using Sentry distributed tracing for collection and visualization.

## What It Does

Provides comprehensive monitoring and performance tracking for GraphQL APIs:

- **Real-time metrics collection** via Apollo Server plugin
- **Distributed tracing** using Sentry for operation and resolver performance
- **Cache performance tracking** with hit/miss rates and response caching analytics
- **Multi-release comparison** for performance regression detection
- **CI/CD integration** via Playwright reporter that posts metrics to GitHub PRs
- **Interactive dashboard** with D3-based visualizations

## Architecture

### Data Flow

1. **Apollo Server Plugin** (`sentry-metrics-plugin.ts`) creates Sentry spans for each GraphQL operation
2. **Sentry** stores traces with operation timing, resolver execution, and cache metrics
3. **Metrics Store** (`metrics-store.ts`) queries Sentry Discover API for aggregated data
4. **Visualization** via admin dashboard or Playwright reporter for CI

### Components

**Core:**
- `sentry-client.ts` - Sentry Discover API client for querying trace data
- `metrics-store.ts` - Metrics aggregation and data access layer
- `types.ts` - TypeScript interfaces for metrics data structures

**Apollo Integration:**
- `sentry-metrics-plugin.ts` - Apollo Server plugin for distributed tracing

**Visualization:**
- `cache-chart.tsx` - Visx/D3 chart for cache hit/miss visualization
- `durations-chart.tsx` - Visx/D3 chart for operation duration analysis

**CI/CD:**
- `metrics-reporter.ts` - Playwright reporter for automated metrics collection
- `metrics-comparator.ts` - Baseline comparison logic
- `table-formatter.ts` - Markdown table formatting for GitHub comments

## Integration Guide

### 1. Prerequisites

Install dependencies:
```bash
npm install @sentry/nextjs @visx/axis @visx/event @visx/group @visx/responsive @visx/scale @visx/shape @visx/tooltip d3
```

### 2. Environment Variables

```bash
# Required for Sentry integration
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# Optional: Enable metrics in non-dev environments
METRICS_ENABLED=true

# For CI integration
GITHUB_TOKEN=your_github_token
```

### 3. Apollo Server Setup

```typescript
import { createSentryMetricsPlugin } from "./metrics/sentry-metrics-plugin";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    createSentryMetricsPlugin(
      process.env.NODE_ENV === "development" || process.env.METRICS_ENABLED
    ),
    // ... other plugins
  ],
});
```

### 4. API Endpoints (Next.js)

Create endpoints to expose metrics data:

```typescript
// pages/api/admin/metrics/index.ts
import { getOperationMetrics, getResolverMetrics } from "src/metrics/metrics-store";

export default async function handler(req, res) {
  const operations = await getOperationMetrics();
  const resolvers = await getResolverMetrics();
  res.json({ operations, resolvers });
}
```

### 5. Dashboard Page (Optional)

```typescript
import GraphQLCacheChart from "src/metrics/cache-chart";
import GraphQLDurationsChart from "src/metrics/durations-chart";
import { listReleases, getOperationMetricsByRelease } from "src/metrics/metrics-store";

// See src/pages/admin/metrics/index.tsx for full implementation
```

### 6. Playwright Integration (Optional)

```typescript
// playwright.config.ts
import { createMetricsReporterOptions } from "./src/metrics/metrics-reporter";

export default defineConfig({
  reporter: [
    [
      "./src/metrics/metrics-reporter.ts",
      createMetricsReporterOptions({
        githubToken: process.env.GITHUB_TOKEN,
        deploymentUrl: process.env.PLAYWRIGHT_BASE_URL,
        enabled: !!process.env.CI,
        artifactPath: "test-results/graphql-metrics.json",
      }),
    ],
  ],
});
```

## Usage

### Viewing Metrics Locally

Development mode includes console logging with visual bar charts:

```bash
npm run dev
# Make GraphQL requests
# Check console for metrics output
```

### Querying via CLI

```bash
# List available releases
yarn metrics list-releases

# Get operation metrics for a release
yarn metrics operations --release <release-id>
```

See `cli.ts` for CLI implementation.

### Dashboard Access

Navigate to `/admin/metrics` for the interactive dashboard with:
- Release selector (multi-select)
- Sentry configuration display
- Cache hit/miss charts
- Duration comparison charts
- Detailed metrics table

### CI/CD Workflow

1. Playwright tests run against deployment
2. Metrics reporter fetches data from `/api/admin/metrics`
3. Compares against baseline from main branch
4. Posts formatted report to GitHub PR
5. Saves metrics as test artifacts for future comparisons

## Metrics Collected

### Operation Metrics
- Request count
- Average duration (ms)
- Total duration (ms)
- Error count and rate
- Cache hit rate
- Response cache hits/misses

### Resolver Metrics
- Execution count per resolver
- Average duration per resolver
- Error count per resolver

## Technical Details

### Sentry Integration

Uses Sentry's distributed tracing (spans) to track:
- GraphQL operation spans with operation name
- Child spans for each resolver execution
- Span attributes for cache performance

Data is queried via Sentry Discover API using custom filters and aggregations.

### Chart Implementation

Charts use Visx (D3 wrapper) for:
- Responsive sizing with `ParentSize`
- Horizontal stacked bar charts
- Interactive tooltips
- Multi-release comparison overlays

### Baseline Comparison

Playwright reporter downloads metrics artifacts from main branch GitHub Actions runs:
- Compares operation-by-operation
- Calculates delta percentages
- Flags regressions and improvements
- Provides summary statistics

## Project-Specific Files

The following files remain in their original locations due to framework constraints:

- `src/pages/api/admin/metrics/` - Next.js API routes (routing convention)
- `src/pages/admin/metrics/index.tsx` - Next.js dashboard page (routing convention)
- `scripts/metrics.ts` - CLI tool for querying metrics

These files import from `src/metrics/` and can serve as integration examples.

## References

- Sentry Discover API: https://docs.sentry.io/api/discover/
- Apollo Server Plugins: https://www.apollographql.com/docs/apollo-server/integrations/plugins/
- Visx Charts: https://airbnb.io/visx/
- Playwright Reporters: https://playwright.dev/docs/test-reporters
