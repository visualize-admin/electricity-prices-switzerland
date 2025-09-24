/**
 * Peer group mapping from id to energy and settlement density
 * This has been generated from the RDF data in the SPARQL endpoint.
 * The data from src/lib/db/sparql-peer-groups.ts has been used to create this mapping
 * manually through AI assistance as the data is static and not expected to change often.
 * TODO: See if this information could be stored in the database directly.
 */
export const peerGroupMapping: Record<
  string,
  { energy_density: string; settlement_density: string }
> = {
  "0": { energy_density: "N.A.", settlement_density: "N.A." },
  "1": { energy_density: "High", settlement_density: "High" },
  "2": { energy_density: "Low", settlement_density: "High" },
  "3": { energy_density: "High", settlement_density: "Medium" },
  "4": { energy_density: "Low", settlement_density: "Medium" },
  "5": { energy_density: "High", settlement_density: "Rural" },
  "6": { energy_density: "Low", settlement_density: "Rural" },
  "7": { energy_density: "High", settlement_density: "Mountain" },
  "8": { energy_density: "Low", settlement_density: "Mountain" },
  "9": { energy_density: "High", settlement_density: "Tourist" },
  "10": { energy_density: "Low", settlement_density: "Tourist" },
};
