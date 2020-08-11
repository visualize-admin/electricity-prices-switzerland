import { getSource, getView } from "./rdf";
import { Source, View } from "@zazuko/rdf-cube-view-query";

const OBSERVATIONS_CUBE =
  "https://energy.ld.admin.ch/elcom/energy-pricing/cube";
const CANTON_OBSERVATIONS_CUBE =
  "https://energy.ld.admin.ch/elcom/energy-pricing/median/cube";

export type ServerContext = {
  source: Source;
  observationsView: View;
  cantonObservationsView: View;
};

export const context = async (): Promise<ServerContext> => {
  console.time("Cubes");
  const source = getSource();
  const [observationsCube, cantonObservationsCube] = await Promise.all([
    source.cube(OBSERVATIONS_CUBE),
    source.cube(CANTON_OBSERVATIONS_CUBE),
  ]);

  if (!observationsCube) {
    throw Error(`Cube ${OBSERVATIONS_CUBE} not found`);
  }
  if (!cantonObservationsCube) {
    throw Error(`Cube ${CANTON_OBSERVATIONS_CUBE} not found`);
  }

  console.timeEnd("Cubes");

  return {
    source,
    observationsView: getView(observationsCube),
    cantonObservationsView: getView(cantonObservationsCube),
  };
};
