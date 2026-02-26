# Dependency Updates

## Overview

9 update groups. Verify (`pnpm typecheck` + `pnpm build:next`) between each group before proceeding.


## Group 1 — Lingui i18n (v3 → v5)

> Major upgrade across 2 versions. Read the [v4](https://lingui.js.org/releases/migration-4.html) and [v5](https://lingui.js.org/releases/migration-5.html) migration guides first.
> Key changes: new catalog format, updated `Trans` macro, `useLingui` API changes.

```bash
pnpm add \
  "@lingui/core@^5" \
  "@lingui/react@^5" \
  "@lingui/macro@^5"

pnpm add -D \
  "@lingui/cli@^5"

pnpm locales:compile
pnpm locales:extract
pnpm typecheck
pnpm build:next
```


## Group 2 — Storybook (v8 → v10)

> Use the official Storybook upgrade CLI — it applies codemods and updates config automatically.

```bash
npx storybook@latest upgrade

# Review changes to .storybook/ config and stories
pnpm storybook        # verify dev server
pnpm build-storybook  # verify production build
```


## Group 3 — MUI (v5 → v7)

> Run codemods for both v6 and v7 migrations. Many component APIs changed.
> Read the [MUI v6](https://mui.com/material-ui/migration/upgrade-to-v6/) and [v7](https://mui.com/material-ui/migration/upgrade-to-v7/) migration guides.

```bash
pnpm add \
  "@mui/material@^7" \
  "@mui/utils@^7"

# Run official codemods
npx @mui/codemod@latest v6.0.0/all .
npx @mui/codemod@latest v7.0.0/all .

pnpm typecheck
pnpm build:next
# Visual inspection recommended (Storybook or dev server)
```


## Group 4 — Next.js (v15 → v16) + eslint-config-next

> `eslint-config-next` version must always match the Next.js version.
> Next.js 16 likely requires React 19 — coordinate with Group 12.

```bash
pnpm add \
  "next@^16" \
  "@next/env@^16"

pnpm add -D \
  "@next/bundle-analyzer@^16" \
  "eslint-config-next@^16"

pnpm typecheck
pnpm build:next
pnpm dev  # smoke test
```


## Group 5 — React 19

> ⚠️ Also update the `pnpm.overrides` pins for `@types/react` and `@types/react-dom` in `package.json`.
> Check `react-query` v3 compatibility — it is very old and may not work with React 19.
> A migration to `@tanstack/react-query` v5 may be needed at the same time.

```bash
pnpm add \
  "react@^19" \
  "react-dom@^19"

# If react-query v3 breaks, migrate to @tanstack/react-query:
# pnpm add @tanstack/react-query
# pnpm remove react-query

pnpm typecheck
pnpm test:unit
pnpm build:next
```


## Group 6 — Zod v4

> Zod v4 has breaking API changes. Read the [Zod v4 migration guide](https://zod.dev/v4) first.
> Audit all usages: `grep -r "from 'zod'" src/`

```bash
grep -r "from 'zod'" src/ --include="*.ts" --include="*.tsx" -l

pnpm add "zod@^4"

pnpm typecheck
pnpm test:unit
```


## Group 7 — Remaining major upgrades

Split into sub-batches and verify after each.

### 7a — urql + undici

```bash
pnpm add "urql@^5" "undici@^7"
pnpm typecheck && pnpm build:next
```

### 7b — node-fetch + fs-extra (ESM-only)

> ⚠️ `node-fetch` v3 and `fs-extra` v11 are ESM-only. Any `require()` call will break.
> Audit usages before upgrading: `grep -r "node-fetch\|fs-extra" src/ scripts/`

```bash
grep -r "node-fetch\|fs-extra" src/ scripts/ --include="*.ts" --include="*.js" -l

pnpm add "node-fetch@^3" "fs-extra@^11"
pnpm add -D "@types/fs-extra@^11"

pnpm typecheck && pnpm build:next
```

### 7c — micromark

```bash
pnpm add "micromark@^4" "micromark-extension-gfm@^3"
pnpm typecheck && pnpm build:next
```

### 7d — deck.gl (v8 → v9)

> Read the [deck.gl v9 upgrade guide](https://deck.gl/docs/upgrade-guide).

```bash
pnpm add "@deck.gl/core@^9" "@deck.gl/layers@^9" "@deck.gl/react@^9"
pnpm typecheck && pnpm build:next
# Visual inspection of map components required
```

### 7e — RDF / SPARQL stack

> These packages are tightly coupled — update together.

```bash
pnpm add \
  "rdf-ext@^2" \
  "sparql-http-client@^3" \
  "@rdfjs/namespace@^2" \
  "@tpluscode/rdf-ns-builders@^5" \
  "@tpluscode/sparql-builder@^3"

pnpm add -D \
  "@types/rdf-ext@^2" \
  "@types/rdfjs__namespace@^2" \
  "@types/sparql-http-client@^3"

pnpm typecheck && pnpm build:next
```

### 7f — Miscellaneous

```bash
pnpm add \
  "make-plural@^8" \
  "global-agent@^4" \
  "react-inspector@^9"

pnpm typecheck && pnpm build:next
```


## Kept for later

```bash
pnpm update \
  @interactivethings/swiss-federal-ci \
  "@typescript/native-preview"
```


## [ ] Group 8 — Vitest

ERROR feat: Update vitest + jsdom

 ⨯ [Error: require() of ES Module /Users/patrick/work/electricity-prices-switzerland.deps/node_modules/.pnpm/@csstools+css-calc@3.1.1_@csstools+css-parser-algorithms@4.0.0_@csstools+css-tokenizer@_e728870d3b76a40220e2f2b00c51483a/node_modules/@csstools/css-calc/dist/index.mjs not supported.
Instead change the require of /Users/patrick/work/electricity-prices-switzerland.deps/node_modules/.pnpm/@csstools+css-calc@3.1.1_@csstools+css-parser-algorithms@4.0.0_@csstools+css-tokenizer@_e728870d3b76a40220e2f2b00c51483a/node_modules/@csstools/css-calc/dist/index.mjs to a dynamic import() which is available in all CommonJS modules.

> ⚠️ The project is already on Vitest 4.x (prerelease track). Do **not** downgrade to 3.x (npm `latest` tag).
> Only patch-update within 4.x and align `@vitest/browser` to the same version.

```bash
pnpm add -D \
  "vitest@^4" \
  "@vitest/browser@^4" \
  "jsdom@^27"

pnpm test:unit
pnpm test:integration
```


## Group 9 — Prettier (v2 → v3)

> Prettier 3 has formatting changes. Reformat the whole codebase and commit separately.

```bash
pnpm add -D "prettier@^3"
pnpm prettier --write .
git diff --stat  # Review scope of formatting changes
# Commit formatting changes as a standalone commit
```


## Group 10 — ESLint 9 (flat config migration)

> ESLint 9 requires migrating from `.eslintrc.json` to `eslint.config.js` (flat config).
> `eslint-config-next` must be updated together with Next.js (Group 11) — skip it here.

```bash
pnpm add -D \
  "eslint@^9" \
  "eslint-plugin-react-hooks@^7" \
  "eslint-plugin-unused-imports@^4"

# Migrate .eslintrc.json → eslint.config.js
npx @eslint/migrate-config .eslintrc.json

# Review and fix the generated eslint.config.js, then:
pnpm lint
```
