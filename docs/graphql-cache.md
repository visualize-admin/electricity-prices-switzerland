# GraphQL Response Cache

Apollo's response cache stores full GraphQL responses for the duration of their `@cacheControl(maxAge)` hint. By default it lives in each server instance's memory, so with several replicas every instance has its own cold cache. Setting `REDIS_URL` makes all instances share one Redis instead.

## Why It Exists

Production runs many replicas (see `values-p.yaml` in the gitops repository). With in-memory caches, a query answered by one pod still misses on the others, and every deployment starts cold. A shared Redis lets a response computed once serve all pods.

## How It Works

- `src/lib/graphql-cache.ts` picks the backend: Redis when `REDIS_URL` is set, Apollo's `InMemoryLRUCache` otherwise. It is passed as `cache` to the Apollo server in `src/pages/api/graphql.ts`.
- Redis failures count as cache misses. While Redis is unreachable, requests are served uncached rather than failing or waiting, and the client reconnects on its own. Connection errors are logged once per distinct error.
- Entries expire through Redis TTLs that match the `maxAge` hints. Redis itself is expected to run with a memory limit and the `allkeys-lru` eviction policy, and without persistence.

## Process Caches

The smaller caches in front of SPARQL use the same Redis when `REDIS_URL` is set, through `createSharedCache` in `src/lib/shared-cache.ts`: CSV exports, coverage ratios and the municipality lookup. Without `REDIS_URL` each one is an in-memory LRU, as before.

- Keys are `cache:<namespace>:<key>` with a TTL per cache. Values are stored as JSON, with `Map`s converted. Redis failures count as misses here too.
- With Redis, the CSV export warmup in `src/instrumentation.ts` fills the cache the download routes read. Instrumentation is bundled separately from the API routes and gets its own module instances, so with in-memory caches the warmup only fills its own copy.
- Concurrent misses on CSV exports and coverage ratios share one computation per process, not across instances.
- The search index (`src/lib/search-index-cache.ts`) stays in memory.
- On `/admin/caches`, each cache shows its backend (Redis or memory). Clearing a Redis one applies to all instances.

## Checking Which Backend Is Used

- Admin page `/admin/caches` shows a "GraphQL response cache" panel: backend, Redis host and connection status, key count, and memory use.
- `GET /api/admin/graphql-cache` returns the same as JSON (admin session or `ADMIN_API_TOKEN` bearer token).

## Deployment

The gitops repository's Helm chart has a `redis.enabled` value (default `false`). When `true` for an environment, it creates a Redis Deployment and Service in that namespace and sets `REDIS_URL` on the app pods. Each environment (ref, abn, prod) gets its own Redis. The `redis.image` value should point at an image available on Nexus.

## Local Development

- Plain: `docker run -p 6379:6379 redis:7-alpine`, then `REDIS_URL=redis://localhost:6379 pnpm dev`.
- Against a minikube install of the Helm chart: `kubectl port-forward svc/<release>-redis 16379:6379` in the app namespace, then `REDIS_URL=redis://localhost:16379 pnpm dev`.
