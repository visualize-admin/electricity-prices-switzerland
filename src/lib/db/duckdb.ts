import fs from "fs";
import path from "path";

import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";

import { setupCleanupHandlers } from "src/lib/db/cleanup";
import { decryptSunshineCsvFile, getCsvDataPath } from "src/lib/sunshine-csv";

let instance: DuckDBInstance | null = null;
let connection: DuckDBConnection | null = null;

/**
 * Initialize the DuckDB database
 */
export const setupDatabaseConnection = async (): Promise<DuckDBConnection> => {
  if (connection) return connection;

  try {
    // Create an in-memory database instance
    instance = await DuckDBInstance.create(":memory:");
    connection = await instance.connect();

    // Set home directory
    await connection.run(`SET home_directory='/tmp';`);

    return connection;
  } catch (error) {
    console.error("Failed to initialize DuckDB:", error);
    throw error;
  }
};

/**
 * Close the DuckDB database connection
 */
export const closeDuckDB = (): void => {
  if (connection) {
    console.info("Closing DuckDB connection...");
    connection.disconnectSync();
    connection = null;
  }
  instance = null;
};

/**
 * Execute a SQL query and return the results
 * @param sql SQL query to execute
 * @param params Optional parameters for prepared statements
 * @returns Query results
 */
export const query = async <T = unknown>(
  sql: string,
  params?: Parameters<DuckDBConnection["runAndReadAll"]>[1]
): Promise<T[]> => {
  await ensureDatabaseInitialized();
  const connection = await setupDatabaseConnection();

  try {
    let reader;
    if (params) {
      reader = await connection.runAndReadAll(sql, params);
    } else {
      reader = await connection.runAndReadAll(sql);
    }
    return reader.getRowObjects() as T[];
  } catch (error) {
    console.error("DuckDB query error:", error);
    throw error;
  }
};

/**
 * Execute a SQL query that doesn't return results
 * @param sql SQL query to execute
 */
const exec = async (sql: string): Promise<void> => {
  if (!connection) {
    throw new Error(
      "DuckDB connection not initialized. Call initDuckDB() first."
    );
  }

  try {
    await connection.run(sql);
  } catch (error) {
    console.error("DuckDB exec error:", error);
    throw error;
  }
};

/**
 * Initialize the database and load all required data
 */
export const setupDatabase = async (): Promise<void> => {
  // Initialize the database
  await setupDatabaseConnection();

  // Decrypt Sunshine CSV data
  await decryptSunshineCsvFile("Sunshine 2022 28.05.2025");
  await decryptSunshineCsvFile("Sunshine 2023 28.05.2025");
  await decryptSunshineCsvFile("Sunshine 2024 28.05.2025");
  await decryptSunshineCsvFile("Sunshine 2025 28.05.2025");
  await decryptSunshineCsvFile("peer-groups");

  // Read SQL setup file
  const setupSQL = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/db/sunshine-setup.sql"),
    "utf-8"
  );

  await exec(
    `SET VARIABLE sunshine_2022_csv_path='${getCsvDataPath(
      "Sunshine 2022 28.05.2025.csv"
    )}';`
  );
  await exec(
    `SET VARIABLE sunshine_2023_csv_path='${getCsvDataPath(
      "Sunshine 2023 28.05.2025.csv"
    )}';`
  );
  await exec(
    `SET VARIABLE sunshine_2024_csv_path='${getCsvDataPath(
      "Sunshine 2024 28.05.2025.csv"
    )}';`
  );
  await exec(
    `SET VARIABLE sunshine_2025_csv_path='${getCsvDataPath(
      "Sunshine 2025 28.05.2025.csv"
    )}';`
  );
  await exec(
    `SET VARIABLE peer_groups_csv_path='${getCsvDataPath("peer-groups.csv")}';`
  );
  // Execute SQL setup
  await exec(setupSQL);

  console.info("DuckDB setup completed successfully");
}; // Database initialization will be handled asynchronously on first query
let databaseInitialized = false;
/**
 * Ensure database is initialized before running queries
 */

export const ensureDatabaseInitialized = async (): Promise<void> => {
  if (!databaseInitialized) {
    setupCleanupHandlers();
    console.info("Initializing DuckDB database...");
    await setupDatabase();
    console.info("Setup database connection.");
    await setupDatabaseConnection();
    databaseInitialized = true;
  }
};
