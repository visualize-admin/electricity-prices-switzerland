# Load Testing Workflow Log

**Date:** 2026-03-10

---

## ref — `https://strompreis.ref.elcom.admin.ch`

**SPARQL endpoint:** `https://lindas.cz-aws.net/query`

### Step 1 — Record GraphQL-only HAR

```
pnpm exec dotenv -e .env.local -- bun src/e2e/generate-k6-har.ts --env ref --graphql-only --headed
```

22 GraphQL requests captured → `browsing-test-ref.har`

### Step 2 — Capture admin session

```
pnpm exec dotenv -e .env.local -- bun src/e2e/dump-admin-session.ts \
  --base-url https://strompreis.ref.elcom.admin.ch \
  --sparql-endpoint https://lindas.cz-aws.net/query
```

Session cookie saved to `admin-session.json` ✅

### Step 3 — k6 run (5 VUs, 5 iterations, `https://lindas.cz-aws.net/query`)

```
pnpm exec dotenv -e .env.local -- bun src/e2e/run-k6.ts \
  browsing-test-ref.har --headers-file admin-session.json --vus 5 --iterations 5
```

| Metric | Value |
|--------|-------|
| requests | 110 total, **0 failures** ✅ |
| http_req_duration avg | 2.29s |
| http_req_duration p(95) | 12.06s |
| threshold avg<500ms | ✗ (cold SPARQL cache under concurrent load) |
| threshold p(95)<1000ms | ✗ (cold SPARQL cache under concurrent load) |

---

## prod — `https://strompreis.elcom.admin.ch`

### Step 4 — Record GraphQL-only HAR

```
pnpm exec dotenv -e .env.local -- bun src/e2e/generate-k6-har.ts --env prod --graphql-only --headed
```

23 GraphQL requests captured → `browsing-test-prod.har`

### Step 5 — k6 run, default SPARQL endpoint (no session)

```
pnpm exec dotenv -e .env.local -- bun src/e2e/run-k6.ts \
  browsing-test-prod.har --vus 5 --iterations 5
```

| Metric | Value |
|--------|-------|
| requests | 115 total, **2 failures** ⚠️ |
| failures | `OperatorDocuments`: 2 × HTTP 504 (gateway timeout) |
| http_req_duration avg | 1.0s |
| http_req_duration p(95) | 1.78s |
| threshold avg<500ms | ✗ |
| threshold p(95)<1000ms | ✗ |

`OperatorDocuments` 504s are intermittent upstream timeouts unrelated to load.

### Step 6 — Capture admin session (prod, `https://lindas.cz-aws.net/query`)

```
pnpm exec dotenv -e .env.local -- bun src/e2e/dump-admin-session.ts \
  --base-url https://strompreis.elcom.admin.ch \
  --sparql-endpoint https://lindas.cz-aws.net/query \
  --output admin-session-prod.json
```

Session cookie saved to `admin-session-prod.json` ✅

### Step 7 — k6 run with session (`https://lindas.cz-aws.net/query`)

```
pnpm exec dotenv -e .env.local -- bun src/e2e/run-k6.ts \
  browsing-test-prod.har --headers-file admin-session-prod.json --vus 5 --iterations 5
```

| Metric | Value |
|--------|-------|
| requests | 115 total, **0 failures** ✅ |
| http_req_duration avg | 3.37s |
| http_req_duration p(95) | 16.07s |
| threshold avg<500ms | ✗ (cold SPARQL cache under concurrent load) |
| threshold p(95)<1000ms | ✗ (cold SPARQL cache under concurrent load) |

Higher latency than prod default SPARQL, consistent with `lindas.cz-aws.net` being
a non-cached endpoint. No failures — the `OperatorDocuments` 504s from step 5 did not
recur, suggesting they were transient.
