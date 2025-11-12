#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

import * as argparse from "argparse";

import { getSunshineDataService } from "src/lib/sunshine-data-service";

import {
  fetchOperationalStandards,
  fetchOperatorCostsAndTariffsData,
  fetchPowerStability,
} from "../src/lib/sunshine-data";

// Now always uses SPARQL service
const mockSunshineDataService = getSunshineDataService();

interface FetcherOptions {
  operatorId: string;
  enableCosts: boolean;
  enableStability: boolean;
  enableOpStandards: boolean;
  outputDir: string;
}

const operatorNames = [
  "Soltrix Energy",
  "Apexion Power",
  "NexaVolt Solutions",
  "TerraCore Utilities",
  "Quantum Gridworks",
  "Vortiq Energy Systems",
  "BlueNova Energy",
  "RadiantArc Power",
  "EcoVerge Utilities",
  "Helionix Power Co.",
  "GridMorph Energy",
  "Fluxwave Energy",
  "Coreterra Power",
  "FusionSpan Utilities",
  "NovaHarvest Energy",
  "Peakphase Power",
  "ElectraNex Energy",
  "GreenVibe Power",
  "Sunclave Energy",
  "TurbineX Solutions",
  "Powerquark Utilities",
  "Zephyrion Grid",
  "DynaGenix Energy",
  "LucentCore Power",
  "CleanSpire Energy",
  "Voltania Group",
  "Nexenflow Utilities",
  "Brightshift Energy",
  "Stratavolt Solutions",
  "AeroTide Power",
  "EarthPulse Energy",
  "Zyntara Utilities",
  "Megalux Power Systems",
  "Soluxion Energy Co.",
  "HorizonSpark Utilities",
  "EcoFuse Gridworks",
  "Omniflow Energy",
  "TrueAmp Utilities",
  "HyperVibe Energy",
  "Altigen Solutions",
  "EcoAxis Energy",
  "Sparkterra Utilities",
  "Windova Power",
  "EtherCore Energy",
  "Purewatt Systems",
  "Greenbeat Grid",
  "Fluxonomy Energy",
  "Ionixis Utilities",
  "Zenithra Power",
  "Enerlytix Corp",
  "Voltstride Solutions",
  "Sunlinea Power",
  "ZeonGrid Energy",
  "Ecorelic Utilities",
  "GridHaven Energy",
  "NovaAmp Systems",
  "RevoPulse Power",
  "Etherlume Energy",
  "BlueCrest Power",
  "WindLoom Utilities",
  "ArcMatter Energy",
  "PowerNova Corp",
  "Dynawatt Solutions",
  "Lumora Grid Co.",
  "Volturex Energy",
  "Radianta Power",
  "OmegaStream Utilities",
  "TerraLink Power",
  "Ionflow Energy",
  "EcoMagnetix",
  "GridEcho Utilities",
  "NexCraft Power",
  "Windnetic Energy",
  "EcoVerra Solutions",
  "SparkNex Energy",
  "CoreVanta Utilities",
  "SolStream Power",
  "Kinetral Energy",
  "OmniArc Utilities",
  "PulseNova Energy",
  "Fluxora Power",
  "Ampenity Energy",
  "ViridisGrid Co.",
  "StellarGen Utilities",
  "GreenTide Systems",
  "AetherForge Energy",
  "ArcadiaAmp",
  "TerraVolt Solutions",
  "QuantumLux Power",
  "Emberline Energy",
  "EcoThrive Utilities",
  "VortexPath Energy",
  "LuminoGrid Systems",
  "VoltSpring Energy",
  "BlueHelio Power",
  "Gravion Energy",
  "ClarityGrid Utilities",
  "PureShift Power",
  "HorizonAxis Energy",
  "AuroraPulse Systems",
];

const makePicker = <T>(replacementValues: T[]) => {
  const choices = [...replacementValues];
  const mapped = new Map<T, T>();
  return (initialName: T) => {
    if (choices.length === 0) {
      throw new Error("No more operator names available");
    }
    if (mapped.has(initialName)) {
      return mapped.get(initialName)!; // Return the already mapped name
    }
    const index = Math.floor(Math.random() * choices.length);
    const name = choices[index];
    mapped.set(initialName, name); // Map the initial name to the chosen name
    choices.splice(index, 1); // Remove the chosen name to avoid duplicates
    return name;
  };
};

const pickId = makePicker(Array.from({ length: 1000 }).map((_, i) => i));
const pickName = makePicker(operatorNames);

async function generateMocks(options: FetcherOptions) {
  try {
    const outputDir = path.resolve(options.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Test operator ID
    const operatorId = options.operatorId;

    if (options.enableCosts) {
      console.info(
        `\n--- Fetching operator costs and tariffs data for operator ${operatorId} ---`
      );
      const costsAndTariffs = await fetchOperatorCostsAndTariffsData(
        mockSunshineDataService,
        {
          operatorId: operatorId,
          networkLevel: "NE5",
          period: 2025,
          category: "C2",
        }
      );

      // Change names of operators in the data
      for (const attr of [
        "energyTariffs",
        "netTariffs",
        "networkCosts",
      ] as const) {
        const rates = costsAndTariffs[attr];
        rates.yearlyData.forEach((data) => {
          data.operator_name = pickName(data.operator_name);
          data.operator_id = pickId(data.operator_id);
        });
      }

      const outputPath = path.join(
        outputDir,
        `sunshine-costsAndTariffs-${operatorId}.json`
      );
      fs.writeFileSync(outputPath, JSON.stringify(costsAndTariffs, null, 2));
      console.info(`Saved to ${outputPath}`);
    }

    if (options.enableStability) {
      console.info(
        `\n--- Fetching power stability data for operator ${operatorId} ---`
      );
      const powerStability = await fetchPowerStability(
        mockSunshineDataService,
        {
          operatorId: operatorId,
        }
      );
      for (const attr of ["saidi", "saifi"] as const) {
        const stabilityData = powerStability[attr];
        stabilityData.yearlyData.forEach((data) => {
          data.operator_name = pickName(data.operator_name);
          data.operator_id = pickId(data.operator_id);
        });
      }
      const outputPath = path.join(
        outputDir,
        `sunshine-powerStability-${operatorId}.json`
      );
      fs.writeFileSync(outputPath, JSON.stringify(powerStability, null, 2));
      console.info(`Saved to ${outputPath}`);
    }

    if (options.enableOpStandards) {
      console.info(
        `\n--- Fetching operational standards for operator ${operatorId} ---`
      );
      const operationalStandards = await fetchOperationalStandards(
        mockSunshineDataService,
        {
          operatorId,
        }
      );
      const outputPath = path.join(
        outputDir,
        `sunshine-operationalStandards-${operatorId}.json`
      );
      fs.writeFileSync(
        outputPath,
        JSON.stringify(operationalStandards, null, 2)
      );
      console.info(`Saved to ${outputPath}`);
    }

    console.info("\n--- All mocks generated successfully ---");
  } catch (error) {
    console.error("Error generating mocks:", error);
    process.exit(1);
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

  parser.add_argument("--stability", {
    help: "Generate mocks for power stability data",
    action: "store_true",
    dest: "enableStability",
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
    args.enableStability = true;
    args.enableOpStandards = true;
  }

  // If no specific data type is enabled, enable all by default
  if (!args.enableCosts && !args.enableStability && !args.enableOpStandards) {
    args.enableCosts = true;
    args.enableStability = true;
    args.enableOpStandards = true;
  }

  return args as FetcherOptions;
}

// Run the generator
generateMocks(parseArguments()).catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
