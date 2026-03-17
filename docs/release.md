# Releasing a New Version

## Steps

### 1. Update the changelog

Add an entry to `CHANGELOG.md` at the root of the project documenting what changed in this release.

### 2. Bump the version in package.json

Edit `package.json` and increment the `"version"` field following [semver](https://semver.org/).

### 3. Build the Docker image locally

```bash
pnpm docker:build
# equivalent: docker buildx build --platform linux/amd64 -t interactivethings/electricity-prices-switzerland .
```

### 4. Verify the image starts

```bash
docker run -ti interactivethings/electricity-prices-switzerland /bin/bash
# Ctrl-D or `exit` to stop
```

### 5. Scan for vulnerabilities with Trivy

```bash
pnpm docker:trivy
# equivalent: trivy image interactivethings/electricity-prices-switzerland:latest \
#   --offline-scan --image-src docker --scanners vuln \
#   --severity HIGH,CRITICAL --show-suppressed --ignore-unfixed
```

All HIGH and CRITICAL findings must be resolved or suppressed before proceeding.

### 6. Commit and tag

```bash
git add CHANGELOG.md package.json
git commit -m "chore: vX.Y.Z"
git tag -m "vX.Y.Z" vX.Y.Z
```

### 7. Push

The `postversion` npm script handles this automatically when using `pnpm version`:

```bash
pnpm version <major|minor|patch>
# runs preversion (lint), bumps version, commits, tags, then:
# git push origin main --follow-tags
# git push origin main:test --force-with-lease
```

Alternatively push manually:

```bash
git push origin main --follow-tags
git push origin main:test --force-with-lease
```

CI will build the tagged image and publish it to GHCR, then deploy to the test environment.
