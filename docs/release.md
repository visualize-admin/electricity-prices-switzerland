# Releasing a New Version

## Steps

### 1. Update the changelog

Add an entry to `CHANGELOG.md` at the root of the project documenting what changed in this release.

Move the entries from the `# Unreleased` section under a new `# X.Y.Z - YYYY-MM-DD` heading, then put `Nothing yet.` in the (now empty) `# Unreleased` section:

```md
# Unreleased

Nothing yet.

# X.Y.Z - YYYY-MM-DD

- ...
```

### 2. Bump the version in package.json

Edit `package.json` and increment the `"version"` field following [semver](https://semver.org/).

### 3. Check that the locales match Accent

CI downloads the translations from Accent before building the image and fails
when they differ from the repository. Run the same check locally (needs
`ACCENT_API_KEY`):

```bash
pnpm locales:export
git diff --exit-code src/locales
```

If it shows a diff, decide which side is right:

- Accent is right: commit the downloaded locales.
- The repository is right (for example a translation was changed in a PR):
  update the strings in Accent (`pnpm locales:browse`). The `Sync locales to
  Accent` workflow does not overwrite existing translations. Then run the check
  again.

### 4. Build the Docker image locally

```bash
pnpm docker:build
# equivalent: docker buildx build --platform linux/amd64 -t interactivethings/electricity-prices-switzerland .
```

### 5. Verify the image starts

```bash
docker run -ti interactivethings/electricity-prices-switzerland /bin/bash
# Ctrl-D or `exit` to stop
```

### 6. Scan for vulnerabilities with Trivy

```bash
pnpm docker:trivy
# equivalent: trivy image interactivethings/electricity-prices-switzerland:latest \
#   --offline-scan --image-src docker --scanners vuln \
#   --severity HIGH,CRITICAL --show-suppressed --ignore-unfixed
```

All HIGH and CRITICAL findings must be resolved or suppressed before proceeding.

### 7. Commit and tag

```bash
git add CHANGELOG.md package.json
git commit -m "chore: vX.Y.Z"
git tag -m "vX.Y.Z" vX.Y.Z
```

### 8. Push

The `postversion` npm script handles this automatically when using `pnpm version`:

```bash
pnpm version <major|minor|patch>
# runs preversion (lint), bumps version, commits, tags, then:
# git push origin main --follow-tags
```

Alternatively push manually:

```bash
git push origin main --follow-tags
```

CI will build the tagged image and publish it to GHCR.
