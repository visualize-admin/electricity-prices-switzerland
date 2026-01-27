## Build Process

### Build ID Configuration

The Next.js build ID is configured to use the git commit SHA to ensure consistent and reproducible build ids across different environments.

#### How it works

The build ID is generated using the `generateBuildId` function in `next.config.ts`, which follows this priority:

1. **Docker builds**: Uses the `GIT_COMMIT_SHA` environment variable
2. **Vercel deployments**: Uses the `VERCEL_GIT_COMMIT_SHA` environment variable (automatically provided by Vercel)
3. **Fallback**: Uses Next.js default build ID generation if no SHA is provided

#### Environment Variables

- `GIT_COMMIT_SHA`: Passed as a build argument in the Dockerfile and set as an environment variable during the build process
- `VERCEL_GIT_COMMIT_SHA`: Automatically available in Vercel's build environment

#### GitHub Actions

The `.github/workflows/docker.yml` workflow passes the git commit SHA to the Docker build using the `github.sha` context variable:

```yaml
build-args: |
  GIT_COMMIT_SHA=${{ github.sha }}
```

This ensures that:

- The build ID matches the exact commit that triggered the build
- Multiple builds of the same commit produce identical build IDs
- The build verification step can correctly validate that the build ID matches the static assets folder

#### Build Verification

The Dockerfile includes a verification step that checks the build ID consistency:

```bash
BUILD_ID=$(cat .next/BUILD_ID)
if [ ! -d ".next/static/$BUILD_ID" ]; then
  echo "ERROR: Build ID mismatch detected!"
  exit 1
fi
```

This catches any inconsistencies between the build ID file and the actual static assets folder structure. We have experienced in the past inconsistencies, see
[#564](https://github.com/visualize-admin/electricity-prices-switzerland/issues/564).

#### Local Development

When building locally without setting `GIT_COMMIT_SHA`, the build will use Next.js's default build ID generation. To test with a specific commit SHA locally:

```bash
export GIT_COMMIT_SHA=$(git rev-parse HEAD)
pnpm build
```
