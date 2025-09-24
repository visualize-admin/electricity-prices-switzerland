/**
 * Peer group mapping from letters to energy and settlement density
 * FIXME: This is mock data based on the SPARQL hardcoded mapping
 * Should be replaced with actual data from the backend when available
 */
export const peerGroupMapping: Record<
  string,
  { energy_density: string; settlement_density: string }
> = {
  A: { energy_density: "High", settlement_density: "Medium" },
  B: { energy_density: "High", settlement_density: "Rural" },
  C: { energy_density: "High", settlement_density: "Mountain" },
  D: { energy_density: "High", settlement_density: "Unknown" },
  E: { energy_density: "Low", settlement_density: "Medium" },
  F: { energy_density: "Low", settlement_density: "Rural" },
  G: { energy_density: "Low", settlement_density: "Mountain" },
  H: { energy_density: "Low", settlement_density: "Tourist" },
  NA: { energy_density: "N.A.", settlement_density: "N.A." },
};
