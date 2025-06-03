# Sunshine Data DuckDB Implementation

This implementation provides a new way to work with the Sunshine data, loading it directly from CSV files into a DuckDB database for efficient querying and processing.

## Overview

The implementation consists of several components:

1. **DuckDB Connection Management**: Handles the database connection lifecycle using the modern DuckDB Neo API
2. **SQL Setup**: Creates tables, views, and indexes for efficient data access
3. **Data Access Layer**: Provides functions to query the data for the application
4. **Lazy Initialization**: Database is initialized on first query to improve startup performance

## Files

- `duckdb.ts` - Core DuckDB connection and utility functions using the new DuckDB Neo API
- `sunshine-data.ts` - Data access functions for the Sunshine dataset
- `sunshine-setup.sql` - SQL script to set up tables, views, and indexes
- `cleanup.ts` - Manages database connection cleanup
- `index.ts` - Exports all data functions

## How It Works

1. The database is initialized lazily when the first query is executed with `ensureDatabaseInitialized()`
2. CSV files are loaded into memory tables:
   - `Sunshine 2024 28.05.2025.csv` → `sunshine_2024` table
   - `Sunshine 2025 28.05.2025.csv` → `sunshine_2025` table
   - `peer-groups.csv` → `peer_groups` table
3. SQL views are created to provide easy access to specific data subsets
4. API functions like `fetchOperatorCostsAndTariffsData()` query these tables and views

## API Functions

The following functions are available for use in the application:

### `getPeerGroup(operatorId: string): Promise<PeerGroup | null>`

Returns the peer group information for an operator.

### `fetchOperatorCostsAndTariffsData(operatorId: string): Promise<SunshineCostsAndTariffsData>`

Returns costs and tariffs data for an operator, including:
- Network costs
- Energy tariffs
- Net tariffs
- Peer group comparisons

### `fetchPowerStability(operatorId: string): Promise<SunshinePowerStabilityData>`

Returns power stability metrics for an operator, including:
- SAIDI (System Average Interruption Duration Index)
- SAIFI (System Average Interruption Frequency Index)
- Historical data and peer group comparisons

### `fetchOperationalStandards(operatorId: string): Promise<SunshineOperationalStandardsData>`

Returns operational standards data for an operator, including:
- Product variety information
- Service quality metrics
- Compliance data

## Testing

You can test the implementation with:

```bash
npm run test:sunshine-data
```

This will run a script that queries data for a test operator and outputs the results.

## Performance Considerations

- DuckDB runs in-memory for maximum performance
- Uses the modern DuckDB Neo API with Promise support
- SQL views and indexes are used to optimize queries
- Lazy initialization improves application startup time
- Connection cleanup is handled explicitly when the application exits

## Extending

To add new data or queries:

1. Update the `sunshine-setup.sql` file with new tables or views
2. Add new query functions to `sunshine-data.ts`
3. Export the new functions from `index.ts`