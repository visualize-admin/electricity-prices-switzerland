# Energy Prices CLI

A command-line tool that reports why the energy prices map colors a given municipality the way it does: which operators serve it, whether that link comes from Offers or Observations data, which operators are excluded by coverage-ratio filtering, and the resulting legend color.

It has a second mode, triggered by omitting `--municipality`, that instead scans every municipality and reports which ones the map would render without a color ("gray"), and why.

## Why It Exists

The map's color for a municipality depends on several layers: operator-municipality coverage, price observations, coverage-ratio filtering, and a threshold-based color scale. These are otherwise only inspectable by reading logs or stepping through the app in a browser. Gray areas in particular — municipalities or operator territories that render without any fill color — are otherwise only found by scrolling the rendered map yourself.

The CLI is a debugging tool for both humans and AI agents. A support investigation and an AI agent verifying a pricing/coverage change can both run it and read structured, reproducible output instead of a rendered map.

It fetches data through the same GraphQL documents and pure computation functions the map component uses (`src/domain/energy-prices-map-data.ts`). Its output matches what the UI shows for the same inputs; it is not a separate reimplementation that can drift.

## Usage

### Single municipality report

```bash
pnpm energy-prices:cli --year 2025 --category H4 --price-component total --product standard --municipality Zurich
```

| Flag                | Required | Description                                                                    |
| ------------------- | -------- | ------------------------------------------------------------------------------ |
| `--year`            | yes      | e.g. `2025`                                                                    |
| `--category`        | yes      | Electricity category, e.g. `H4`                                                |
| `--price-component` | yes      | e.g. `total`, `gridusage`, `energy`                                            |
| `--product`         | yes      | e.g. `standard`, `cheapest`                                                    |
| `--municipality`    | yes      | Municipality id or name                                                        |
| `--network-level`   | no       | e.g. `NE5`, `NE6`, `NE7`; defaults to the server's default (`NE7`)             |
| `--locale`          | no       | Defaults to `en`; use `de`/`fr`/`it` for localized municipality/operator names |
| `--endpoint`        | no       | GraphQL endpoint to query; defaults to `http://localhost:3000/api/graphql`     |

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

`Municipality Operator via` reports whether the operator-municipality link for that year/network level came from that year's own offer entities (`OFFERS`) or was borrowed from `FALLBACK_OFFERS_YEAR`'s offers because the requested year has none of its own (`OFFERS_2025`; see [Coverage Ratio Filtering](./coverage.md)).

The "Operator coverage" section lists every operator with a price observation for that municipality/year/category/product at the given `--network-level`, including ones normally excluded from the map for having a coverage ratio below the threshold. Those are marked `IGNORED (below threshold)`. This relies on the `networkLevel` and `includeBelowCoverageThreshold` arguments on the `observations` GraphQL query (see `src/graphql/schema.graphql`); the latter is intended for debugging only and is not used by the map itself.

### Gray-area scan

Omit `--municipality` to scan every municipality instead:

```bash
pnpm energy-prices:cli --year 2025 --category H4 --price-component total --product standard --entity operator
```

| Flag       | Required | Description                                                                                        |
| ---------- | -------- | -------------------------------------------------------------------------------------------------- |
| `--entity` | no       | `municipality` (default) or `operator` — which map view's coloring rules to check                  |
| `--limit`  | no       | Max number of gray areas printed (default `50`, `0` for no limit); the total count is always shown |

`--year`, `--category`, `--price-component`, `--product`, `--network-level`, `--locale`, `--endpoint` behave the same as above.

- `--entity municipality` checks the municipality map view: a municipality is gray when it has no price observation at all (`src/components/map-layers.tsx`'s `makeMunicipalityLayer`).
- `--entity operator` checks the operator map view: a municipality is gray when **none** of the operators serving it (per that year's operator-municipality offers) has a usable price value — even if some of its operators do have data, the mean is only computed over the ones that do, so this only fires when every serving operator lacks one (`makeOperatorLayer`).

For each gray municipality, every relevant operator is reported with why it has no usable value: no observation exists at all for that year/category/product, an observation exists but was filtered out by the coverage-ratio threshold, or an observation exists but resolves to a null/empty value.

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

## Reference

| File                                   | Purpose                                                                                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/energy-prices-cli.ts`         | CLI implementation                                                                                                                              |
| `src/domain/energy-prices-report.ts`   | Single-municipality report logic                                                                                                                |
| `src/domain/gray-areas-report.ts`      | Gray-area scan logic, shared by both `--entity` modes                                                                                           |
| `src/domain/energy-prices-map-data.ts` | Shared pure functions for grouping observations and computing the legend color, used by both the CLI and the `useEnrichedEnergyPricesData` hook |
| `src/graphql/node-client.ts`           | Standalone GraphQL client for use outside React                                                                                                 |
| [coverage.md](./coverage.md)           | Coverage-ratio threshold and Offers vs Observations provenance                                                                                  |
