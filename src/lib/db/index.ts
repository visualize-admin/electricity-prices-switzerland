import { setupCleanupHandlers } from "./cleanup";
import { setupDatabaseConnection, setupDatabase } from "./duckdb";
import {
  fetchOperationalStandards,
  fetchOperatorCostsAndTariffsData,
  fetchPowerStability,
} from "./sunshine-data";

setupCleanupHandlers();

// Export functions
export {
  // Database connection functions
  setupDatabaseConnection as initDuckDB,
  setupDatabase,

  // Data access functions
  fetchOperationalStandards,
  fetchOperatorCostsAndTariffsData,
  fetchPowerStability,
};
