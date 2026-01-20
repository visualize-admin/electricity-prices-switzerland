# GraphQL Metrics

Automatically collect and track GraphQL performance metrics to catch regressions before they reach production—with zero extra effort.

## What This Is

A performance monitoring system that piggybacks on existing Playwright tests to track how the GraphQL server performs. Every time scenario tests run (either locally or in a PR), the system automatically collects metrics about:

- Which GraphQL operations were called and how often
- How long each operation took
- Cache hit rates (whether responses are being cached effectively)
- Error rates
- Individual resolver performance within each operation

This provides instant feedback about performance characteristics without writing a single line of test code.

## Why It Exists

**Track impact of code changes**: See how changes to the codebase affect performance—whether optimizations actually improve speed, or whether new features introduce slowdowns.

**Zero extra effort**: No dedicated performance tests to write or maintain. Metrics are collected automatically whenever scenario tests run.

**Local development feedback**: Compare performance between branches locally to validate optimizations or investigate slowdowns during development.

## How It Works

The system has three parts that work together:

1. **Apollo Server Plugin** (see `src/server/metrics/apollo-plugin.ts`)

   - Automatically tracks every GraphQL request that comes through the server
   - Records timing, cache hits, errors, and resolver-level breakdown
   - Stores metrics in Redis, isolated by deployment or branch

2. **Metrics API Endpoint** (see `src/pages/api/admin/metrics/`)

   - Provides an endpoint to fetch collected metrics
   - Protected by authentication in production environments
   - Includes a `/clear` endpoint for development

3. **Playwright Reporter** (see `tests/reporters/metrics-reporter.ts`)
   - Runs after Playwright tests complete
   - Fetches metrics from the API
   - Posts a formatted summary as a GitHub PR comment

**In pull requests**: Tests run on Vercel preview → metrics are collected → posted as PR comment
**Locally**: Tests run against localhost → metrics stored by branch → query via API

## Using Metrics in Pull Requests

When a PR is opened, GitHub Actions runs Playwright tests against the Vercel preview deployment. After tests complete, a comment appears on the PR with a table showing:

- GraphQL operations called during tests
- Request counts and average duration
- Cache hit rates
- Error counts and rates
- Expandable resolver-level breakdown

Example comment format:

```
📊 Server Metrics for this PR

GraphQL Operations
| Operation    | Requests | Avg Duration | Cache Hit Rate | Errors   |
| Observations      | 42       | 120ms        | 85%            | 1 (2.4%) |
| Municipalities | 156      | 45ms         | 92%            | 0        |
```

When additional commits are pushed, the comment updates in place.

## Comparing Branches Locally

The system isolates metrics by git branch, making it easy to compare performance between branches during development.

### Basic workflow:

```bash
# On a feature branch
METRICS_ENABLED=true npm run test:e2e
curl http://localhost:3000/api/admin/metrics | jq

# Switch to main to establish a baseline
git checkout main
curl http://localhost:3000/api/admin/metrics/clear
METRICS_ENABLED=true npm run test:e2e
curl http://localhost:3000/api/admin/metrics | jq

# Switch back to compare
git checkout my-feature-branch
# (metrics are still there, isolated by branch)
curl http://localhost:3000/api/admin/metrics | jq
```

Each branch maintains its own metrics until explicitly cleared. Tests can be run on one branch, then on another, then results compared.

### Tips for local comparison:

- Run tests multiple times on each branch to smooth out variance
- Use `jq` to extract specific metrics: `jq '.operations.Observations.avgDurationMs'`
- Clear metrics with `/api/admin/metrics/clear` before collecting fresh data
- Metrics persist for 24 hours

## Setting Up Locally

### Prerequisites

Redis must be running locally. Two options:

**Docker Compose** (recommended):

```yaml
# Add to docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

**Or install directly**:

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
```

### Environment variables

Add to `.env.local`:

```bash
METRICS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

With these settings, metrics are automatically collected when `npm run test:e2e` runs.

### Viewing metrics

```bash
# After running tests
curl http://localhost:3000/api/admin/metrics | jq

# For a fresh start
curl http://localhost:3000/api/admin/metrics/clear
```

## Configuration Reference

The system automatically detects its environment and adjusts behavior:

| Environment           | Redis Backend | Authentication | Metrics Isolated By         |
| --------------------- | ------------- | -------------- | --------------------------- |
| Vercel (preview/prod) | Upstash       | Required       | Vercel deployment ID        |
| Local development     | Local Redis   | None           | `local-{hostname}-{branch}` |
| Local (no Redis)      | Disabled      | N/A            | N/A                         |

### Environment variables needed:

**For local development:**

- `METRICS_ENABLED=true` - Turn on metrics collection
- `REDIS_URL=redis://localhost:6379` - Connect to local Redis

**For PR comments (GitHub Actions):**

- `ADMIN_API_TOKEN` - Shared secret to fetch metrics from preview deployment
- `GITHUB_TOKEN` - Automatically available in GitHub Actions

**For Vercel deployments:**

- `METRICS_ENABLED=true` - Set in Vercel project settings
- `UPSTASH_REDIS_REST_URL` - From Upstash integration
- `UPSTASH_REDIS_REST_TOKEN` - From Upstash integration
- `ADMIN_API_TOKEN` - Set in Vercel secrets

See the implementation files for full details:

- Redis adapters: `src/server/metrics/redis/`
- Metrics plugin: `src/server/metrics/apollo-plugin.ts`
- API endpoints: `src/pages/api/admin/metrics/`
- Playwright reporter: `tests/reporters/metrics-reporter.ts`
- Reporter configuration: `playwright.config.ts`
