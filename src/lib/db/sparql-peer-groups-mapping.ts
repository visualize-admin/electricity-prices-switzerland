export type SettlementDensity =
  | "High"
  | "Medium"
  | "Rural"
  | "Mountain"
  | "Tourist"
  | "N.A.";
export type EnergyDensity = "High" | "Low" | "N.A.";

/**
 * Peer group mapping from id to energy and settlement density
 * This has been generated from the RDF data in the SPARQL endpoint.
 * The data from src/lib/db/sparql-peer-groups.ts has been used to create this mapping
 * manually through AI assistance as the data is static and not expected to change often.
 * See sunshine.sparqlbook (## Peer Group) for the queries used to extract the data.
 *
 * TODO: See if this information could be stored in the database directly.
 *
 */
const peerGroupMapping: Record<
  string,
  { energy_density: EnergyDensity; settlement_density: SettlementDensity }
> = {
  "0": {
    settlement_density: "N.A.",
    energy_density: "N.A.",
  },
  "1": {
    settlement_density: "High",
    energy_density: "High",
  },
  "2": {
    settlement_density: "High",
    energy_density: "Low",
  },
  "3": {
    settlement_density: "Medium",
    energy_density: "High",
  },
  "4": {
    settlement_density: "Medium",
    energy_density: "Low",
  },
  "5": {
    settlement_density: "Rural",
    energy_density: "High",
  },
  "6": {
    settlement_density: "Rural",
    energy_density: "Low",
  },
  "7": {
    settlement_density: "Mountain",
    energy_density: "High",
  },
  "8": {
    settlement_density: "Mountain",
    energy_density: "Low",
  },
  "9": {
    settlement_density: "Tourist",
    energy_density: "High",
  },
  "10": {
    settlement_density: "Tourist",
    energy_density: "Low",
  },
};
