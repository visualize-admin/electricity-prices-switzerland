import { getSource, getView } from "./rdf";
import { Source, View } from "@zazuko/rdf-cube-view-query";

const OBSERVATIONS_CUBE =
  "https://energy.ld.admin.ch/elcom/electricity-price/cube";
const CANTON_OBSERVATIONS_CUBE =
  "https://energy.ld.admin.ch/elcom/electricity-price/median/cube";

export type ServerContext = {
  source: Source;
  observationsView: View;
  cantonObservationsView: View;
};

export const context = async (): Promise<ServerContext> => {
  // FIXME: Cache disabled – for now because of out-of-memory errors
  let contextCache: ServerContext | undefined;
  // if (contextCache) {
  //   return contextCache;
  // }

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

  contextCache = {
    source,
    observationsView: getView(observationsCube),
    cantonObservationsView: getView(cantonObservationsCube),
  };

  return contextCache;
};
