#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

import * as argparse from "argparse";

import { closeDuckDB } from "../src/lib/db/duckdb";
import {
  ensureDatabaseInitialized,
  fetchOperationalStandards,
  fetchOperatorCostsAndTariffsData,
  fetchPowerStability,
} from "../src/lib/db/sunshine-data";

interface FetcherOptions {
  operatorId: string;
  enableCosts: boolean;
  enablePower: boolean;
  enableOpStandards: boolean;
  outputDir: string;
}

async function generateMocks(options: FetcherOptions) {
  try {
    // Initialize the database explicitly
    await ensureDatabaseInitialized();

    const outputDir = path.resolve(options.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Test operator ID
    const operatorId = options.operatorId;

    if (options.enableCosts) {
      console.log(
        `\n--- Fetching operator costs and tariffs data for operator ${operatorId} ---`
      );
      const costsAndTariffs = await fetchOperatorCostsAndTariffsData(
        operatorId
      );
      const outputPath = path.join(
        outputDir,
        `fetchOperatorCostsAndTariffsData-${operatorId}.json`
      );
      fs.writeFileSync(outputPath, JSON.stringify(costsAndTariffs, null, 2));
      console.log(`Saved to ${outputPath}`);
    }

    if (options.enablePower) {
      console.log(
        `\n--- Fetching power stability data for operator ${operatorId} ---`
      );
      const powerStability = await fetchPowerStability(operatorId);
      const outputPath = path.join(
        outputDir,
        `fetchPowerStability-${operatorId}.json`
      );
      fs.writeFileSync(outputPath, JSON.stringify(powerStability, null, 2));
      console.log(`Saved to ${outputPath}`);
    }

    if (options.enableOpStandards) {
      console.log(
        `\n--- Fetching operational standards for operator ${operatorId} ---`
      );
      const operationalStandards = await fetchOperationalStandards(operatorId);
      const outputPath = path.join(
        outputDir,
        `fetchOperationalStandards-${operatorId}.json`
      );
      fs.writeFileSync(
        outputPath,
        JSON.stringify(operationalStandards, null, 2)
      );
      console.log(`Saved to ${outputPath}`);
    }

    console.log("\n--- All mocks generated successfully ---");
  } catch (error) {
    console.error("Error generating mocks:", error);
  } finally {
    // Close DuckDB connection before exiting
    closeDuckDB();
    // Force exit to ensure all resources are released
    process.exit(0);
  }
}

function parseArguments(): FetcherOptions {
  const parser = new argparse.ArgumentParser({
    description: "Generate mock data from Sunshine database",
  });

  parser.add_argument("-o", "--operator-id", {
    help: "Operator ID to fetch data for",
    required: true,
    dest: "operatorId",
  });

  parser.add_argument("--costs", {
    help: "Generate mocks for operator costs and tariffs",
    action: "store_true",
    dest: "enableCosts",
  });

  parser.add_argument("--power", {
    help: "Generate mocks for power stability data",
    action: "store_true",
    dest: "enablePower",
  });

  parser.add_argument("--op-standards", {
    help: "Generate mocks for operational standards",
    action: "store_true",
    dest: "enableOpStandards",
  });

  parser.add_argument("--all", {
    help: "Generate all types of mocks",
    action: "store_true",
  });

  parser.add_argument("--output-dir", {
    help: "Directory to save mock data",
    default: "./mocks",
    dest: "outputDir",
  });

  const args = parser.parse_args();

  // If --all flag is used, enable all data types
  if (args.all) {
    args.enableCosts = true;
    args.enablePower = true;
    args.enableOpStandards = true;
  }

  // If no specific data type is enabled, enable all by default
  if (!args.enableCosts && !args.enablePower && !args.enableOpStandards) {
    args.enableCosts = true;
    args.enablePower = true;
    args.enableOpStandards = true;
  }

  return args as FetcherOptions;
}

// Run the generator
generateMocks(parseArguments()).catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
