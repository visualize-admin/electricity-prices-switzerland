# Dependency Updates

## Overview

17 update groups ordered from lowest to highest risk. Verify (`pnpm typecheck` + `pnpm build:next`) between each group before proceeding.

---

## Group 1 — Patch / minor bumps (low risk)

```bash
pnpm update \
  @argos-ci/playwright \
  @axe-core/playwright \
  @parcel/watcher \
  @next/env \
  "@turf/bbox" "@turf/centroid" "@turf/turf" \
  "@lingui/babel-plugin-lingui-macro" "@lingui/swc-plugin" "@lingui/vite-plugin" \
  "@mui/system" \
  "@storybook/test" \
  "@vercel/nft" \
  accent-cli \
  d3-format \
  dotenv \
  graphql \
  har-to-k6 \
  html-react-parser \
  jose \
  knip \
  lodash \
  oxlint \
  swiss-maps \
  ts-node \
  tss-react \
  tsx \
  "@types/lodash" "@types/node-fetch" \
  "@testing-library/react" \
  "@graphql-codegen/typescript-resolvers"

pnpm typecheck
pnpm build:next
```

---

## Group 2 — TypeScript type definitions

> ⚠️ Keep `@types/node` on `22.x` (engines requires Node 22). Do **not** update to 25.x.
> ⚠️ `@types/react` and `@types/react-dom` are pinned in `pnpm.overrides` — update both places.
> ⚠️ Skip `@types/rdf-js` (would be a downgrade 4.0.2 → 4.0.1).

```bash
pnpm update \
  "@types/clownface" \
  "@types/d3" \
  "@types/fs-extra" \
  "@types/gettext-parser" \
  "@types/jsdom" \
  "@types/k6" \
  "@types/rdf-ext" \
  "@types/rdfjs__namespace" \
  "@types/sparql-http-client" \
  "@types/xml-c14n"
```

Update `@types/node` to latest 22.x only:

```bash
pnpm add -D "@types/node@^22"
```

Update `@types/react` and `@types/react-dom`, then also update the pinned versions in `pnpm.overrides` in `package.json`:

```bash
pnpm add -D "@types/react@^19" "@types/react-dom@^19"
# Then update pnpm.overrides in package.json to match the new versions
```

```bash
pnpm typecheck
```

---

## Group 3 — TypeScript ESLint

> Must be updated together (same version).

```bash
pnpm add -D \
  "@typescript-eslint/eslint-plugin@^8" \
  "@typescript-eslint/parser@^8"

pnpm lint
```

---

## Group 4 — Prettier (v2 → v3)

> Prettier 3 has formatting changes. Reformat the whole codebase and commit separately.

```bash
pnpm add -D "prettier@^3"
pnpm prettier --write .
git diff --stat  # Review scope of formatting changes
# Commit formatting changes as a standalone commit
```

---

## Group 5 — ESLint 9 (flat config migration)

> ESLint 9 requires migrating from `.eslintrc.json` to `eslint.config.js` (flat config).
> `eslint-config-next` must be updated together with Next.js (Group 14) — skip it here.

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

---

## Group 6 — GraphQL codegen (v5 → v6)

```bash
pnpm add -D \
  "@graphql-codegen/cli@^6" \
  "@graphql-codegen/typescript@^5" \
  "@graphql-codegen/typescript-operations@^5" \
  "@graphql-codegen/typescript-resolvers@^5" \
  "@graphql-codegen/typescript-urql@^4"

pnpm graphql:codegen
pnpm typecheck
```

---

## Group 7 — Vite + build tooling (v6 → v7)

> Check `vite.config.ts` and `vitest.config.ts` for deprecated APIs after upgrading.

```bash
pnpm add -D \
  "vite@^7" \
  "@vitejs/plugin-react@^5" \
  "@rollup/plugin-typescript@^12"

pnpm typecheck
pnpm build:next
```

---

## Group 8 — Vitest

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

---

## Group 9 — Playwright (1.51 → 1.58)

```bash
pnpm add -D "@playwright/test@^1.58"

# Reinstall browser binaries after a Playwright version bump
pnpm exec playwright install

pnpm test:playwright:app
```

---

## Group 10 — Lingui i18n (v3 → v5)

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

---

## Group 11 — Storybook (v8 → v10)

> Use the official Storybook upgrade CLI — it applies codemods and updates config automatically.

```bash
npx storybook@latest upgrade

# Review changes to .storybook/ config and stories
pnpm storybook        # verify dev server
pnpm build-storybook  # verify production build
```

---

## Group 12 — Apollo Server (v4 → v5)

> Check the [Apollo Server v5 migration guide](https://www.apollographql.com/docs/apollo-server/migration).
> `@as-integrations/next` jumps from 1 → 4, review its changelog carefully.

```bash
pnpm add \
  "@apollo/server@^5" \
  "@apollo/server-plugin-response-cache@^5" \
  "@as-integrations/next@^4"

pnpm typecheck
pnpm build:next
# Verify GraphQL endpoint works end-to-end
```

---

## Group 13 — MUI (v5 → v7)

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

---

## Group 14 — Next.js (v15 → v16) + eslint-config-next

> `eslint-config-next` version must always match the Next.js version.
> Next.js 16 likely requires React 19 — coordinate with Group 15.

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

---

## Group 15 — React 19

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

---

## Group 16 — Zod v4

> Zod v4 has breaking API changes. Read the [Zod v4 migration guide](https://zod.dev/v4) first.
> Audit all usages: `grep -r "from 'zod'" src/`

```bash
grep -r "from 'zod'" src/ --include="*.ts" --include="*.tsx" -l

pnpm add "zod@^4"

pnpm typecheck
pnpm test:unit
```

---

## Group 17 — Remaining major upgrades

Split into sub-batches and verify after each.

### 17a — urql + undici

```bash
pnpm add "urql@^5" "undici@^7"
pnpm typecheck && pnpm build:next
```

### 17b — node-fetch + fs-extra (ESM-only)

> ⚠️ `node-fetch` v3 and `fs-extra` v11 are ESM-only. Any `require()` call will break.
> Audit usages before upgrading: `grep -r "node-fetch\|fs-extra" src/ scripts/`

```bash
grep -r "node-fetch\|fs-extra" src/ scripts/ --include="*.ts" --include="*.js" -l

pnpm add "node-fetch@^3" "fs-extra@^11"
pnpm add -D "@types/fs-extra@^11"

pnpm typecheck && pnpm build:next
```

### 17c — micromark

```bash
pnpm add "micromark@^4" "micromark-extension-gfm@^3"
pnpm typecheck && pnpm build:next
```

### 17d — deck.gl (v8 → v9)

> Read the [deck.gl v9 upgrade guide](https://deck.gl/docs/upgrade-guide).

```bash
pnpm add "@deck.gl/core@^9" "@deck.gl/layers@^9" "@deck.gl/react@^9"
pnpm typecheck && pnpm build:next
# Visual inspection of map components required
```

### 17e — RDF / SPARQL stack

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

### 17f — Miscellaneous

```bash
pnpm add \
  "make-plural@^8" \
  "global-agent@^4" \
  "react-inspector@^9"

pnpm typecheck && pnpm build:next
```

## Kept for later

```
pnpm update
  @interactivethings/swiss-federal-ci \
  "@typescript/native-preview" \
```