import { keyBy } from "lodash";

// TODO This is a temporary hardcoded peer group mapping
// We should get the info from Lindas at some point but it
// does not seem the info is there already
// DESCRIBE <https://energy.ld.admin.ch/elcom/electricityprice/group/F>
// does not have this info
export const peerGroups = keyBy(
  [
    {
      id: "A",
      settlement_density: "Urban",
      energy_density: "High",
    },
    {
      id: "B",
      settlement_density: "Suburban",
      energy_density: "Medium-High",
    },
    {
      id: "C",
      settlement_density: "Suburban",
      energy_density: "Medium",
    },
    {
      id: "D",
      settlement_density: "Semi-Rural",
      energy_density: "Medium-Low",
    },
    {
      id: "E",
      settlement_density: "Rural",
      energy_density: "Low",
    },
    {
      id: "F",
      settlement_density: "Remote Rural",
      energy_density: "Very Low",
    },
    {
      id: "G",
      settlement_density: "Alpine",
      energy_density: "Very Low",
    },
    {
      id: "H",
      settlement_density: "Special/Industrial",
      energy_density: "Variable",
    },
  ],
  (x) => x.id
);
