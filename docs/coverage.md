# Coverage Ratio Filtering

Filters out operator-municipality observations based on how much of a municipality's population an operator serves. The coverage ratio (0 to 1) comes from SPARQL "offer" entities. Operators below the 0.25 threshold are excluded to avoid showing misleading price data.

## How It Works

### Coverage Data Source

Coverage ratios are retrieved from SPARQL "offer" entities that contain:

- Municipality: the geographical area
- Period/Year: e.g., "2024"
- Network Level: e.g., "NE5", "NE6", "NE7"
- Operator: the electricity provider
- Coverage Ratio: decimal between 0 and 1

The default network level used for coverage calculations is **NE7** (defined in `DEFAULT_COVERAGE_NETWORK_LEVEL`).

### Filtering Threshold

Items are filtered using a threshold of **0.25** (25%). This means:

- Items with coverage ratio ≥ 0.25 are **included**
- Items with coverage ratio < 0.25 are **excluded**

### The Default Coverage Logic

We use the following strategy when coverage data is unavailable for a specific operator-municipality-network level combination:

1. **If coverage data exists for the municipality-network level combination:**

   - But not for the specific operator → assume coverage ratio of **0** (exclude it)
   - This means "we know other operators have coverage data here, so if this operator doesn't, they likely don't serve this area"

2. **If no coverage data exists for the municipality-network level combination at all:**
   - Assume coverage ratio of **1** (include it by default)
   - This means "we don't have coverage data for this network level in this municipality, so assume full coverage to avoid false negatives"

This logic is implemented in `CoverageCacheManager.getCoverage()` (see `src/rdf/coverage-ratio.ts:162-197`):

```typescript
const cacheKey = coverageRatioKey(municipality, networkLevel, operator);
const cached = yearCache.get(cacheKey);
if (cached === undefined) {
  if (yearCache.get(muniNetworkCountKey(municipality, networkLevel))) {
    // We have coverage data for other operators at this municipality & network level
    // but not for this specific operator → default to 0
    return 0;
  } else {
    // We have no coverage ratios for this network level at all for this municipality
    // → default to 1 (assume full coverage)
    return 1;
  }
} else {
  return cached;
}
```

This prevents both false positives (showing operators with minimal coverage) and false negatives (hiding operators when coverage data is simply unavailable).

## Implementation

### Where Coverage Filtering Is Applied

Coverage filtering is used in three main resolvers:

1. **`observations` resolver** (`src/graphql/resolvers.ts:197-266`)

   - Filters operator observations for municipalities
   - Adds `coverageRatio` to each observation
   - Removes observations below the threshold

2. **`operatorMunicipalities` resolver** (`src/graphql/resolvers.ts:577-605`)

   - Filters operator-municipality relationships for a given period
   - Supports optional `networkLevel` parameter (defaults to NE7)
   - Returns only operators with sufficient coverage

3. **`getMunicipalityOperators` function** (`src/rdf/queries.ts:650-726`)
   - Retrieves operators serving a specific municipality
   - Filters by coverage ratio for the specified network level

### The CoverageCacheManager Class

The `CoverageCacheManager` class (`src/rdf/coverage-ratio.ts`) provides:

- `prepare(years: string[])`: preloads coverage data for the given years into cache
- `getCoverage(observation, networkLevel)`: returns coverage ratio with fallback logic
- `static filterByCoverageRatio<T>(items, coverageAccessor)`: generic filtering method

The static `filterByCoverageRatio` method accepts a `coverageAccessor` function, making it reusable across different data types:

```typescript
CoverageCacheManager.filterByCoverageRatio(results, (item) =>
  coverageManager.getCoverage(
    {
      period,
      municipality: String(item.municipality),
      operator: item.operator,
    },
    networkLevel
  )
);
```

## Caching

Coverage ratios are cached for performance:

- Cache duration: 5 minutes
- Cache key: `coverage-ratios-{year}`
- Cache type: LRU cache with promise-based values

The cache stores:

- Individual coverage ratios keyed by `coverage-{municipality}-{networkLevel}-{operator}`
- Municipality-network level counts keyed by `count-{municipality}-{networkLevel}` (used for the defaulting logic)
- Municipality counts keyed by `count-{municipality}`

## Network Level Support

All coverage-related functions support specifying the network level:

- `getOperatorsMunicipalities()` accepts an optional `networkLevel` parameter
- `getCoverage()` defaults to `DEFAULT_COVERAGE_NETWORK_LEVEL` ("NE7")
- The GraphQL schema allows clients to specify `networkLevel` when querying `operatorMunicipalities`

This allows filtering to be context-aware based on the network level being analyzed.
