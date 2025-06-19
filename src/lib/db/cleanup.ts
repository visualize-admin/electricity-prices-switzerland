import { closeDuckDB } from "./duckdb";

/**
 * Function to clean up database connections
 * This should be called when the application is shutting down
 */
const cleanupDatabaseConnections = (): void => {
  try {
    // Close DuckDB connections
    closeDuckDB();
    console.info("Database connections closed successfully");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
};

/**
 * Setup cleanup handlers for process termination
 */
export const setupCleanupHandlers = (): void => {
  // Handle normal exit
  process.on("exit", () => {
    cleanupDatabaseConnections();
  });

  // Handle CTRL+C
  process.on("SIGINT", () => {
    console.info("Application terminating: cleanup database connections");
    cleanupDatabaseConnections();
  });

  // Handle kill command
  process.on("SIGTERM", () => {
    console.info("Application killed: cleanup database connections");
    cleanupDatabaseConnections();
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", () => {
    console.info("Uncaught exceptions: clean up database connections");
    cleanupDatabaseConnections();
  });
};
