import { Cube, View, Source } from "@zazuko/rdf-cube-view-query";

export type ResolvedMunicipality = {
  id: string;
  name: string;
  view: View;
  source: Source;
};
export type ResolvedProvider = {
  id: string;
  name: string;
  view: View;
  source: Source;
};
export type ResolvedCanton = { id: string };

export type ResolvedObservation = {
  municipality?: string;
  provider?: string;
  category?: string;
  period?: string;
} & { [key: string]: number };
