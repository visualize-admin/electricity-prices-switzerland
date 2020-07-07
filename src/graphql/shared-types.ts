import { Cube, View, Source } from "@zazuko/rdf-cube-view-query";

export type ResolvedMunicipality = { id: string };
export type ResolvedCanton = { id: string };
export type ResolvedProvider = { id: string };
export type ResolvedCube = {
  locale: string;
  cube: Cube;
  view: View;
  source: Source;
};
