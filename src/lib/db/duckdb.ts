import fs from "fs";
import path from "path";

import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";

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

    // Load CSV extensions
    await connection.run("INSTALL httpfs; LOAD httpfs;");

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
    console.log("Closing DuckDB connection...");
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
export const exec = async (sql: string): Promise<void> => {
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
 * Get the absolute path to a file in the project
 * @param relativePath Path relative to the project root
 * @returns Absolute path
 */
export const getFilePath = (relativePath: string): string => {
  return path.resolve(process.cwd(), relativePath);
};

/**
 * Load CSV data into a DuckDB table
 * @param tableName Name of the table to create
 * @param csvPath Path to the CSV file
 * @param options Additional options for loading CSV
 */
export const loadCSV = async (
  tableName: string,
  csvPath: string,
  options: {
    autoDetect?: boolean;
    delimiter?: string;
    header?: boolean;
    drop?: boolean;
  } = {}
): Promise<void> => {
  const {
    autoDetect = true,
    delimiter = ",",
    header = true,
    drop = true,
  } = options;

  const absolutePath = getFilePath(csvPath);

  if (drop) {
    await exec(`DROP TABLE IF EXISTS ${tableName}`);
  }

  if (autoDetect) {
    await exec(
      `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${absolutePath}', header=${header}, delim='${delimiter}')`
    );
  } else {
    await exec(
      `CREATE TABLE ${tableName} AS SELECT * FROM read_csv('${absolutePath}', header=${header}, delim='${delimiter}', auto_detect=false)`
    );
  }
};

/**
 * Initialize the database and load all required data
 */
export const setupDatabase = async (): Promise<void> => {
  // Initialize the database
  await setupDatabaseConnection();

  // Read SQL setup file
  const setupSQL = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/db/sunshine-setup.sql"),
    "utf-8"
  );

  // Execute SQL setup
  await exec(setupSQL);

  console.log("DuckDB setup completed successfully");
};
