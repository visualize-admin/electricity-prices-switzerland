import { DuckDBConnection } from "@duckdb/node-api";
import { ArgumentParser } from "argparse";
import Table from "cli-table3";

import {
  closeDuckDB,
  setupDatabase,
  setupDatabaseConnection,
} from "../src/lib/db/duckdb";

/**
 * Get all view names from the database
 */
async function getViewNames(connection: DuckDBConnection): Promise<string[]> {
  const viewsReader = await connection.runAndReadAll(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_type = 'VIEW' 
    ORDER BY table_name
  `);

  const views = viewsReader.getRowObjects() as { table_name: string }[];
  return views.map((view) => view.table_name);
}

/**
 * Get column information for a specific view
 */
async function getColumnInfo(
  connection: DuckDBConnection,
  viewName: string
): Promise<{ name: string; type: string }[]> {
  const columnsReader = await connection.runAndReadAll(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = '${viewName}'
    ORDER BY ordinal_position
  `);

  const columns = columnsReader.getRowObjects() as {
    column_name: string;
    data_type: string;
  }[];
  return columns.map((col) => ({ name: col.column_name, type: col.data_type }));
}

/**
 * Format a value for display in a table
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return String(value);
  }
}

/**
 * Display view data as a table
 */
async function displayViewData(
  connection: DuckDBConnection,
  viewName: string,
  displaySampleData: boolean
): Promise<void> {
  console.log(`\n=== View: ${viewName} ===\n`);

  // Get column information
  const columns = await getColumnInfo(connection, viewName);

  // Display column information
  const columnTable = new Table({
    head: ["Column Name", "Data Type"],
    colWidths: [30, 20],
    style: { head: ["cyan"] },
  });

  columns.forEach((col) => {
    columnTable.push([col.name, col.type]);
  });

  console.log("Columns:");
  console.log(columnTable.toString());

  // Get sample data (first 10 rows)
  const dataReader = await connection.runAndReadAll(`
    SELECT * FROM ${viewName} LIMIT 10
  `);

  const rows = dataReader.getRowObjectsJson();

  if (rows.length === 0) {
    console.log("No data found in this view.");
    return;
  }

  // Create table for data display
  const columnNames = columns.map((col) => col.name);
  if (displaySampleData) {
    const dataTable = new Table({
      head: columnNames,
      colWidths: columnNames.map((name) =>
        Math.min(Math.max(name.length, 15), 30)
      ),
      wordWrap: true,
      style: { head: ["cyan"] },
    });

    // Add rows to table
    rows.forEach((row) => {
      const rowData = columnNames.map((col) => formatValue(row[col]));
      dataTable.push(rowData);
    });

    console.log("\nSample Data (First 10 rows):");
    console.log(dataTable.toString());
  }
}

/**
 * Script to display all views created in the sunshine-setup.sql file
 * and show the first 10 rows from each view
 */
async function showSunshineViews() {
  // Add argument parser, asking for the view as optional argument
  const parser = new ArgumentParser({
    description: "Show all views created in the sunshine-setup.sql file",
    prog: "show-sunshine-views",
  });
  parser.add_argument("--view", {
    help: "Name of the view to display (optional)",
    type: "string",
  });
  parser.add_argument("--sample", {
    help: "Display sample data from each view (default: false)",
    action: "store_true",
  });
  const args = parser.parse_args();

  let connection: DuckDBConnection | null = null;

  console.log(args);

  try {
    console.log("Initializing DuckDB...");
    // Initialize database with all tables and views
    await setupDatabase();
    connection = await setupDatabaseConnection();

    // Get all views in the database
    console.log("\nFetching all views in the database...");
    const allViewNames = await getViewNames(connection);
    console.log("All views found:", allViewNames);
    const viewNames = allViewNames.filter((name) => {
      return !args.view || name === args.view;
    });

    console.log(viewNames);

    console.log(`Found ${viewNames.length} views in the database:\n`);

    // Display views in a table
    const viewsTable = new Table({
      head: ["View Name"],
      colWidths: [40],
      style: { head: ["cyan"] },
    });

    viewNames.forEach((name) => {
      viewsTable.push([name]);
    });

    // sort for sunshine_all to be first
    viewNames.sort((a, b) =>
      a === "sunshine_all" ? -1 : b === "sunshine_all" ? 1 : 0
    );

    console.log(viewsTable.toString());

    // Display each view's data
    for (const viewName of viewNames) {
      await displayViewData(connection, viewName, args.sample ?? false);
      console.log("\n" + "-".repeat(80));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close connection and cleanup
    closeDuckDB();
    console.log("\nDuckDB connection closed.");
  }
}

// Run the function to show views
showSunshineViews()
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Script completed.");
    process.exit(0);
  });
