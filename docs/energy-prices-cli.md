# Energy Prices CLI

A command-line tool that reports why the energy prices and sunshine maps
color/link things the way they do, using several subcommands.

## Why It Exists

The maps' colors and operator territories depend on several layers:
operator-municipality coverage, price observations, coverage-ratio
filtering, threshold-based color scales, and (for the sunshine map)
per-indicator sunshine data. These are otherwise only inspectable by reading
logs or stepping through the app in a browser.

The CLI is a debugging tool for both humans and AI agents. A support
investigation and an AI agent verifying a pricing/coverage change can both
run it and read structured, reproducible output instead of a rendered map.

It fetches data through the same GraphQL documents and pure computation
functions the maps use (`src/domain/energy-prices-map-data.ts`). Its output
matches what the UI shows for the same inputs; it is not a separate
reimplementation that can drift.

## Usage

```
pnpm energy-prices:cli <command> [args...] [options]
```

### `municipality <id-or-name>`

Reports why a municipality is colored the way it is: which operators serve
it, whether that link comes from Offers or Observations data, which
operators are excluded by coverage-ratio filtering, and the resulting legend
color.

```bash
pnpm energy-prices:cli municipality Zurich --year 2025 --category H4 --price-component total --product standard
```

| Flag                | Required | Description                                                                |
| ------------------- | -------- | -------------------------------------------------------------------------- |
| `<id-or-name>`      | yes      | Municipality id or name (positional)                                       |
| `--year`            | yes      | e.g. `2025`                                                                |
| `--category`        | yes      | Electricity category, e.g. `H4`                                            |
| `--price-component` | yes      | e.g. `total`, `gridusage`, `energy`                                        |
| `--product`         | yes      | e.g. `standard`, `cheapest`                                                |
| `--network-level`   | no       | e.g. `NE5`, `NE6`, `NE7`; defaults to the server's default (`NE7`)         |
| `--locale`          | no       | Defaults to `en`; use `de`/`fr`/`it` for localized names                   |
| `--endpoint`        | no       | GraphQL endpoint to query; defaults to `http://localhost:3000/api/graphql` |

#### Example output

```
Municipality: Arosa (3921)
Operators: Arosa Energie (10)
Municipality Operator via: OFFERS
Year: 2025
Product: standard
Category: H4
Price component: total
Color: light green

Operator coverage (network level: NE7, threshold: 0.25):
  Arosa Energie (10): value=25.558, coverageRatio=1.00
```

`Municipality Operator via` reports whether the operator-municipality link
for that year/network level came from that year's own offer entities
(`OFFERS`) or was borrowed from `FALLBACK_OFFERS_YEAR`'s offers because the
requested year has none of its own (`OFFERS_2025`; see
[Coverage Ratio Filtering](./coverage.md)).

The "Operator coverage" section lists every operator with a price
observation for that municipality/year/category/product at the given
`--network-level`, including ones normally excluded from the map for having
a coverage ratio below the threshold. Those are marked
`IGNORED (below threshold)`. This relies on the `networkLevel` and
`includeBelowCoverageThreshold` arguments on the `observations` GraphQL
query (see `src/graphql/schema.graphql`); the latter is intended for
debugging only and is not used by the map itself.

### `operator <id-or-name>`

The reverse of `municipality`: reports every municipality an operator
serves, grouped by canton. Useful for "does this operator's territory look
right" — e.g. an operator unexpectedly serving municipalities far from its
main canton is easier to spot as a per-canton breakdown than by scanning a
CSV export.

```bash
pnpm energy-prices:cli operator 565 --year 2026
```

| Flag              | Required | Description                                                        |
| ----------------- | -------- | ------------------------------------------------------------------ |
| `<id-or-name>`    | yes      | Operator id or name (positional)                                   |
| `--year`          | yes      | e.g. `2026`                                                        |
| `--network-level` | no       | e.g. `NE5`, `NE6`, `NE7`; defaults to the server's default (`NE7`) |
| `--locale`        | no       | Defaults to `en`                                                   |
| `--endpoint`      | no       | GraphQL endpoint to query                                          |

#### Example output

```
Year: 2026
Operator: Elektrizitätswerk der Stadt Zürich (565)
Network level: NE7 (default)

Municipalities served: 38 across 2 canton(s)

Zürich (1): 30 municipalities
  ...
Graubünden (18): 8 municipalities
  Cazis (3661): via OFFERS, coverageRatio=1.00
  ...
```

### `canton <id-or-name>`

Reports every municipality in a canton, its serving operator(s), and its map
legend color — a canton-scoped view of `municipality`, useful for
eyeballing a whole canton at once instead of one municipality at a time.
`<id-or-name>` must match a canton id or its full display name as returned
by the API (not a two-letter abbreviation like `GR`, which isn't exposed
over GraphQL).

```bash
pnpm energy-prices:cli canton Graubünden --year 2026 --category H4 --price-component total --product standard
```

Same `--year`/`--category`/`--price-component`/`--product`/`--network-level`/
`--locale`/`--endpoint` flags as `municipality`.

### `gray-areas`

Scans every municipality instead of reporting on one entity, and reports
which ones the map would render without a color ("gray"), and why. Gray
areas are otherwise only found by scrolling the rendered map yourself.

```bash
pnpm energy-prices:cli gray-areas --year 2025 --category H4 --price-component total --product standard --entity operator
```

| Flag       | Required | Description                                                                                        |
| ---------- | -------- | -------------------------------------------------------------------------------------------------- |
| `--entity` | no       | `municipality` (default) or `operator` — which map view's coloring rules to check                  |
| `--limit`  | no       | Max number of gray areas printed (default `50`, `0` for no limit); the total count is always shown |

`--year`, `--category`, `--price-component`, `--product`, `--network-level`,
`--locale`, `--endpoint` behave the same as `municipality`.

- `--entity municipality` checks the municipality map view: a municipality
  is gray when it has no price observation at all (`src/components/map-layers.tsx`'s
  `makeMunicipalityLayer`).
- `--entity operator` checks the operator map view: a municipality is gray
  when **none** of the operators serving it (per that year's
  operator-municipality offers) has a usable price value — even if some of
  its operators do have data, the mean is only computed over the ones that
  do, so this only fires when every serving operator lacks one
  (`makeOperatorLayer`).

For each gray municipality, every relevant operator is reported with why it
has no usable value: no observation exists at all for that year/category/product,
an observation exists but was filtered out by the coverage-ratio threshold, or
an observation exists but resolves to a null/empty value.

#### Example output

```
Year: 2025
Price component: total
Category: H4
Product: standard
Entity: operator
Network level: NE7 (default)

Gray areas: 1 / 2112 municipalities

Augst (2822)
  Genossenschaft Elektra Augst (110): no price observation for this year/category/product
```

### `anomalies`

Flags operators that serve municipalities across more than one canton where
at least one canton is a small minority of that operator's total
municipalities. This is a _candidate_ list for a second look, not a bug
report: cross-canton service can be entirely legitimate (e.g. an operator
with century-old hydro/grid infrastructure in a neighboring canton) — it's
the check that turns "why does the map show this municipality served by that
operator" from a manual CSV export + grep into one command.

```bash
pnpm energy-prices:cli anomalies --year 2026
```

| Flag                   | Required | Description                                                                                       |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `--min-minority-ratio` | no       | Flag a canton when it's below this fraction of an operator's total municipalities (default `0.2`) |
| `--limit`              | no       | Max number of flagged operators printed (default `50`, `0` for no limit)                          |

`--year`, `--network-level`, `--locale`, `--endpoint` behave the same as
`operator`.

#### Example output

```
Year: 2026
Network level: NE7 (default)
Minority canton threshold: < 20% of an operator's municipalities

Flagged operators: 1 / 547

Elektrizitätswerk der Stadt Zürich (565): 38 municipalities across 2 cantons
  Zürich (1): 30 (79%)
  Graubünden (18): 8 (21%) — minority
```

### `sunshine <indicator> <id-or-name>`

Reports an operator's value for a sunshine indicator (network costs, tariffs,
SAIDI/SAIFI, outage notification, compliance), alongside the peer median —
the first CLI coverage of sunshine data, mirroring `municipality` but for the
sunshine map instead of the price map.

```bash
pnpm energy-prices:cli sunshine networkCosts 565 --year 2026 --network-level NE7
```

| Flag              | Required | Description                                                                                                                           |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `<indicator>`     | yes      | One of `networkCosts`, `netTariffs`, `energyTariffs`, `saidi`, `saifi`, `outageInfo`, `daysInAdvanceOutageNotification`, `compliance` |
| `<id-or-name>`    | yes      | Operator id or name (positional)                                                                                                      |
| `--network-level` | no       | Only meaningful for `networkCosts` (e.g. `NE5`, `NE6`, `NE7`)                                                                         |

`--year`, `--locale`, `--endpoint` behave the same as `operator`.

#### Example output

```
Year: 2026
Indicator: networkCosts
Network level: NE7
Operator: Elektrizitätswerk der Stadt Zürich (565)
Value: 18514.041
Median (all operators for this filter): 13794.235
Comparison: above median
```

### `diagnose <url>`

Infers which report answers "why does the map look like this" from a
pasted map URL (or bare query string) — reads `tab`, `activeId`, `entity`,
`period`, `category`, `priceComponent`, `product`, `networkLevel`,
`indicator` the same way the map itself does (reusing its own schemas from
`src/domain/query-states.ts`), then runs that report. Saves re-typing the
same filters the map URL already has.

```bash
pnpm energy-prices:cli diagnose "https://.../map?period=2026&tab=sunshine&activeId=565"
```

| Flag    | Required | Description                                 |
| ------- | -------- | ------------------------------------------- |
| `<url>` | yes      | A map URL or bare query string (positional) |

`--locale`, `--endpoint` behave the same as the other subcommands. Exits 1
with "Couldn't recognize a map URL in that" if the input has none of the
map's own query params.

## Admin page

All six reports (plus `diagnose`, as a "Paste a map URL" box) are also
reachable from the browser at `/admin/diagnostics` (behind the same admin
login as the rest of `/admin/*`). Pick a report on the left, fill in its
fields, and run it — the result is the exact same text this CLI prints,
since the page calls the same `fetch*ReportData`/`build*Report` pairs
server-side through `/api/admin/diagnostics/<report>?...`. That API route
also works directly (logged in) for raw JSON, e.g.
`/api/admin/diagnostics/operator?year=2026&operator=565`. Pasting a map URL
runs `inferReportFromMapUrl` (`src/domain/diagnostics/map-url-diagnosis.ts`,
shared with the `diagnose` subcommand) to pick the report and fill its
fields, and runs it right away once everything required is known.

## Reference

All report logic lives under `src/domain/diagnostics/` — one
`fetch*ReportData`/`build*Report` pair per subcommand above, each with an
`*.integration.spec.ts` hitting the real GraphQL API and a saved snapshot
under `__snapshots__/`.

| File                                                  | Purpose                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/energy-prices-cli.ts`                        | CLI implementation (subcommand parsing and dispatch)                                                                                        |
| `src/domain/diagnostics/energy-prices-report.ts`      | `municipality` report logic                                                                                                                 |
| `src/domain/diagnostics/operator-report.ts`           | `operator` report logic                                                                                                                     |
| `src/domain/diagnostics/canton-report.ts`             | `canton` report logic                                                                                                                       |
| `src/domain/diagnostics/gray-areas-report.ts`         | `gray-areas` scan logic, shared by both `--entity` modes                                                                                    |
| `src/domain/diagnostics/operator-anomalies-report.ts` | `anomalies` scan logic                                                                                                                      |
| `src/domain/diagnostics/sunshine-report.ts`           | `sunshine` report logic                                                                                                                     |
| `src/domain/diagnostics/map-url-diagnosis.ts`         | `diagnose` inference logic, shared by the CLI subcommand and the admin page's paste box                                                     |
| `src/domain/diagnostics/operator-lookup.ts`           | Shared operator id-or-name resolution, used by `operator` and `sunshine`                                                                    |
| `src/domain/diagnostics/report-registry.ts`           | Maps each report id to its `fetch`/`build` pair; used by the CLI, `diagnose`, and the admin API route so all three stay in sync             |
| `src/domain/diagnostics/report-specs.ts`              | Client-safe form field specs (labels, options, schema-derived defaults) for the admin page; also the source of the canonical report id list |
| `src/domain/energy-prices-map-data.ts`                | Shared pure functions for grouping observations and computing the legend color, used by the CLI and the `useEnrichedEnergyPricesData` hook  |
| `src/graphql/node-client.ts`                          | Standalone GraphQL client for use outside React (CLI)                                                                                       |
| `src/graphql/execute-graphql-query-as-client.ts`      | Adapts the server's in-process GraphQL executor to the same client shape, so the admin API route reuses the report modules unchanged        |
| `src/pages/api/admin/diagnostics/[report].ts`         | Admin API route: `GET /api/admin/diagnostics/<report>?...` → `{ ok, data, text }`                                                           |
| `src/pages/admin/diagnostics.tsx`                     | Admin page UI                                                                                                                               |
| [coverage.md](./coverage.md)                          | Coverage-ratio threshold and Offers vs Observations provenance                                                                              |
