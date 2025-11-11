# SPARQL Endpoint Comparison

## Purpose

This tooling enables systematic testing and validation of SPARQL endpoint migrations or changes by recording GraphQL responses from different endpoints and automatically comparing them to detect any discrepancies in the data.

**Use cases:**

- Testing a new SPARQL endpoint before switching to it in production
- Validating that a staging/test endpoint returns the same data as production
- Comparing responses from different SPARQL backend providers (e.g., Lindas-prod vs. Lindas-Cognizone)
- Regression testing after SPARQL query optimizations or schema changes

## Overview

The comparison system consists of three main components:

1. **Recording Tool** (`save-graphql-requests.ts`) - Automates capturing GraphQL requests/responses from the application while using a specific SPARQL endpoint
2. **HAR Parser** (`parse-graphql-from-har.ts`) - Extracts and normalizes GraphQL data from Playwright HAR recordings
3. **Comparison Test Suite** (`compare-responses.spec.ts`) - Automated Vitest tests that compare two sets of recorded responses

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ save-graphql-requests.ts                                │
│  - Launches browser via Playwright                      │
│  - Executes predefined user scenario                    │
│  - Records all network traffic to HAR file              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ parse-graphql-from-har.ts                               │
│  - Extracts GraphQL requests from HAR                   │
│  - Generates consistent hash-based filenames            │
│  - Saves as JSON: {request, response, timestamp}        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Saved GraphQL Request Files                             │
│  /tmp/endpoint-A/graphql-{operationName}-{hash}.json    │
│  /tmp/endpoint-B/graphql-{operationName}-{hash}.json    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ compare-graphql-requests-response.spec.ts               │
│  - Vitest test suite                                    │
│  - Compares corresponding files from both directories   │
│  - Special handling for Observations (sorting+sampling) │
│  - Reports differences as test failures                 │
└─────────────────────────────────────────────────────────┘
```

## Workflow

### Step 1: Record Baseline (Production/Reference Endpoint)

Record GraphQL responses from your baseline endpoint (typically production):

```bash
bun src/scripts/save-graphql-requests.ts \
  --endpoint https://lindas.admin.ch/query \
  --output-dir /tmp/lindas-prod \
  --password YOUR_PASSWORD
```

**Key options:**

- `--endpoint` - SPARQL endpoint URL to test
- `--output-dir` - Directory where JSON files will be saved
- `--password` - Password for authenticated access (if required)

### Step 2: Record Candidate (Test/New Endpoint)

Record responses from the endpoint you want to test:

```bash
bun src/scripts/save-graphql-requests.ts \
  --endpoint https://int.lindas.admin.ch/query \
  --output-dir /tmp/lindas-int \
  --password YOUR_PASSWORD
```

### Step 3: Compare Results

Run the comparison test suite:

```bash
# Use --ui to more easily see the tests
EXPECT_FOLDER=/tmp/lindas-prod ACTUAL_FOLDER=/tmp/lindas-int \
  vitest src/scripts/compare-graphql-requests-response.spec.ts
```

### Step 4: Review Results

The test suite will:

- ✅ Pass if responses are identical (excluding timestamps)
- ❌ Fail with detailed diff if responses differ
- Show which specific GraphQL operation and variables caused the failure

## Tools Reference

### save-graphql-requests.ts

Automated Playwright script that records GraphQL requests by executing a predefined user scenario:

- Navigate to the map view and interact with "Zwischbergen" municipality
- Search and select municipalities: "Zürich" and "Bern"
- Change time period from 2025 to 2023
- Navigate to "Bern" municipality detail page via global search
- Interact with chart components (Total, Grid surcharge pursuant to)
- View price distribution charts

Outputs: JSON files named `graphql-{operationName}-{hash}.json`

### parse-graphql-from-har.ts

Extracts GraphQL requests from HAR recordings and generates consistent hash-based filenames for comparison.

### compare-graphql-requests-response.spec.ts

Vitest test suite that compares JSON files between `EXPECT_FOLDER` (baseline) and `ACTUAL_FOLDER` (candidate) directories. Excludes introspection and WikiContent queries.

## Re-running Tests

To re-run comparisons without recording new data:

```bash
EXPECT_FOLDER=/tmp/lindas-prod ACTUAL_FOLDER=/tmp/lindas-test \
  vitest src/scripts/compare-graphql-requests-response.spec.ts --watch
```

## Key Implementation Details

### Data Reproducibility

To ensure reliable comparisons, the GraphQL resolvers have been modified to return deterministic results:

**Sorting in Resolvers** (src/graphql/resolvers.ts):

- `operatorObservationsSorter`: Sorts by period → category → canton → municipality → operator → value
- `cantonMedianObservationsSorter`: Sorts by period → category → canton
- `swissMedianObservationsSorter`: Sorts by period → category

All observation queries apply sorting before returning results, ensuring that identical data always appears in the same order regardless of the SPARQL endpoint's internal ordering.

**File Naming:** Uses hash of GraphQL query + variables: `graphql-{operationName}-{hash}.json` for consistent comparison.

### Excluded Queries

The comparison test suite excludes:

- **Introspection queries**: Schema introspection is metadata, not application data
- **WikiContent queries**: Content may legitimately differ between environments

## Further Information

For implementation details and internal context, see the original [Notion document](https://www.notion.so/interactivethings/21b30da5430280f4ae29d51db94c227f?d=16c30da5430283dca65e830ec9525f40) (private).
