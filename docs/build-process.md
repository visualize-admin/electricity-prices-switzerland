# Build Process

## Build ID

The Next.js build ID is set to the git commit SHA for reproducible builds across environments.

`generateBuildId` in `next.config.ts` uses this priority:

1. Docker builds: uses `GIT_COMMIT_SHA`
2. Vercel deployments: uses `VERCEL_GIT_COMMIT_SHA` (set automatically by Vercel)
3. Fallback: Next.js default build ID

### Environment Variables

- `GIT_COMMIT_SHA`: passed as a Docker build arg
- `VERCEL_GIT_COMMIT_SHA`: set automatically by Vercel

### GitHub Actions

`.github/workflows/docker.yml` passes the SHA via:

```yaml
build-args: |
  GIT_COMMIT_SHA=${{ github.sha }}
```

### Build Verification

The Dockerfile verifies the build ID matches the static assets folder:

```bash
BUILD_ID=$(cat .next/BUILD_ID)
if [ ! -d ".next/static/$BUILD_ID" ]; then
  echo "ERROR: Build ID mismatch detected!"
  exit 1
fi
```

Catches build ID inconsistencies ([#564](https://github.com/visualize-admin/electricity-prices-switzerland/issues/564)).

### Local Development

Without `GIT_COMMIT_SHA`, Next.js uses its default build ID. To test with the current commit SHA:

```bash
export GIT_COMMIT_SHA=$(git rev-parse HEAD)
pnpm build
```
