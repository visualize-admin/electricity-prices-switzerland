## Load testing

Load tests are recorded as HAR files from a Playwright browsing session and replayed with the open-source k6 CLI.

### Run the test locally (k6 CLI)

Requires [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) installed locally.

### Prerequisites

Some environments (ref, abn) are protected by HTTP basic auth. Credentials are stored in `.env.local` under `BASIC_CREDENTIALS_PER_HOST` as a JSON object mapping hostnames to `user:password` strings. They are injected automatically per request hostname at script generation time.

```bash
# .env.local
BASIC_CREDENTIALS_PER_HOST='{"strompreis.ref.elcom.admin.ch":"user:password","strompreis.abn.elcom.admin.ch":"user:password"}'
```

Credentials can be found in 1Password: [Basic auth credentials](https://start.1password.com/open/i?a=Y5HEBVGBTJAV3ACQABB7PQ5ACU&v=y3bz6to4autj23guk4mvt3b6wa&i=hz4ypv3bx5bklgl4qf2tksxtm4&h=interactivethings.1password.com).

```bash
# Record HAR (GraphQL requests only), then run
dotenv -e .env.local -- bun src/e2e/generate-k6-har.ts --env ref --graphql-only --headed --output browsing-test-ref.har
dotenv -e .env.local -- bun src/e2e/run-k6.ts browsing-test-ref.har

# Different environment, VU count, or quick smoke test
dotenv -e .env.local -- bun src/e2e/generate-k6-har.ts --env abn --graphql-only --headed --output browsing-test-abn.har
dotenv -e .env.local -- bun src/e2e/run-k6.ts browsing-test-abn.har --vus 10 --iterations 1
```

### Authenticated load testing

Injects an admin session cookie so requests use a specific SPARQL endpoint.
Password defaults to `ADMIN_SESSION_PASSWORD` from `.env.local`.

```bash
# Capture session cookie (sets sparqlEndpoint flag via /admin/session-config)
dotenv -e .env.local -- bun src/e2e/dump-admin-session.ts \
  --base-url https://strompreis.ref.elcom.admin.ch \
  --sparql-endpoint https://lindas.cz-aws.net/query \
  --output admin-session.json

# Run with injected session
dotenv -e .env.local -- bun src/e2e/run-k6.ts browsing-test-ref.har --headers-file admin-session.json
```
