# GraphQL Metrics

Performance monitoring system that tracks GraphQL operations using Sentry distributed tracing.

## What This Is

A monitoring system that automatically collects performance metrics for all GraphQL operations:

- Operation request counts and duration
- Cache hit rates (response caching effectiveness)
- Error rates and exceptions
- Individual resolver performance (when enabled)

Metrics are collected via Sentry's distributed tracing infrastructure and can be queried using the Sentry API or via the provided CLI tools.

## Why It Exists

**Track impact of code changes**: See how changes to the codebase affect performance—whether optimizations actually improve speed, or whether new features introduce slowdowns.

**Production visibility**: Monitor real-world performance characteristics across different releases and deployments.

**Zero instrumentation overhead**: Metrics are collected automatically through Apollo Server plugins without writing additional test code.

## How It Works

### Data Collection

The `sentry-metrics-plugin.ts` Apollo Server plugin (see `src/metrics/sentry-metrics-plugin.ts`):

1. Creates a Sentry span for each GraphQL operation
2. Sets `span.op = "graphql.operation"`
3. Records `cache_status` attribute (`"HIT"` or `"MISS"`)
4. Tracks operation duration automatically
5. Optionally creates child spans for individual resolvers

Spans are sent to Sentry and automatically grouped by release (based on git commit SHA).

### Querying Metrics

The `sentry-client.ts` module (see `src/metrics/sentry-client.ts`):

1. Queries Sentry Events API with `dataset=spans`
2. Groups by `span.description` (operation name) and `cache_status`
3. Aggregates metrics: request count, duration, cache hits/misses
4. Returns structured data for analysis

## Using the Metrics CLI

A command-line tool provides quick access to metrics data from Sentry.

### Prerequisites

1. **Sentry Auth Token**: Create a token at https://sentry.io/settings/account/api/auth-tokens/
   - Required scopes: `org:read`, `project:read`
   - Add to `.env.local`: `SENTRY_AUTH_TOKEN=your_token_here`

### Commands

List all releases with metrics:
```bash
yarn metrics operations list-releases
```

Get metrics for a specific release:
```bash
yarn metrics operations get --release 68e6f0a634283737c27138c9d2329e17cb61e185
```

Example output:
```
Operation                      Requests       Hits     Misses    Hit Rate   Avg Duration
---------------------------------------------------------------------------------------
AllMunicipalities                    10          8          2       80.0%         45.2ms
wikiContent                           8          8          0      100.0%         12.3ms
SunshineDataByIndicator               5          2          3       40.0%         89.1ms
```

Get resolver-level metrics for an operation:
```bash
yarn metrics operations get --release <release-id> --operation wikiContent
```

See `src/metrics/cli.ts` for implementation details.

## Configuration

### Environment Variables

**For Sentry tracing (all environments):**
- `SENTRY_TRACES_SAMPLE_RATE` - Sample rate for tracing (0.0 to 1.0)
  - Default: 1.0 (100%) on Vercel, 0.1 (10%) in production outside Vercel

**For querying metrics (CLI tool):**
- `SENTRY_AUTH_TOKEN` - Required to query Sentry API

### Sentry Configuration

Sentry is configured in three files:
- `sentry.server.config.ts` - Server-side initialization
- `sentry.edge.config.ts` - Edge runtime initialization
- `src/lib/sentry/constants.ts` - Shared DSN configuration

The release identifier is automatically set by the Sentry Next.js plugin based on `VERCEL_GIT_COMMIT_SHA` or local git state.

## Troubleshooting

### No metrics found

Check that:
- The Sentry plugin is enabled in your Apollo Server configuration
- The application has received GraphQL requests for the release
- Tracing is enabled (`SENTRY_TRACES_SAMPLE_RATE > 0`)
- Data is within the query time window (default: 24h for operations)

### Verify spans in Sentry UI

1. Go to https://sentry.io/organizations/interactive-things/
2. Navigate to Performance → Traces
3. Filter: `span.op:graphql.operation`
4. Check for recent spans with `cache_status` attribute

### CLI errors

**"SENTRY_AUTH_TOKEN not configured"**: Create and configure a Sentry auth token as described in Prerequisites.

**"Sentry API request failed"**: Verify your auth token has the correct scopes (`org:read`, `project:read`) and you have network access to sentry.io.

## Implementation Files

Key files in the implementation:
- `src/metrics/sentry-metrics-plugin.ts` - Apollo Server plugin for collecting metrics
- `src/metrics/sentry-client.ts` - Client for querying Sentry API
- `src/metrics/cli.ts` - CLI tool for querying metrics
- `src/lib/sentry/constants.ts` - Shared Sentry configuration
- `sentry.server.config.ts` - Server Sentry initialization
- `sentry.edge.config.ts` - Edge Sentry initialization
