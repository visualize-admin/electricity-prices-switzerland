/**
 * This file contains types that are specific to the GraphQL resolvers implementation.
 *
 * They are returned by parent resolvers to pass on more fields than specified in the GraphQL schema to field resolvers.
 * E.g. a top-level query will pass a View and Source to field resolvers
 *
 */

import { Cube, View, Source } from "rdf-cube-view-query";

export type ResolvedSearchResult = {
  id: string;
  name: string;
  type: string;
};
export type ResolvedMunicipality = {
  id: string;
  name: string;
  // view: View;
  // source: Source;
};
export type ResolvedOperator = {
  id: string;
  name: string;
  // view: View;
  // source: Source;
};
export type ResolvedCanton = { id: string };

export type ResolvedMedianObservation = {
  __typename: "MedianObservation";
  category?: string;
  period?: string;
  region?: string;
  regionLabel?: string;
} & { [key: string]: number };

export type ResolvedOperatorObservation = {
  __typename: "OperatorObservation";
  municipality?: string;
  operator?: string;
  category?: string;
  period?: string;
  region?: string;
  regionLabel?: string;
} & { [key: string]: number };

export type ResolvedObservation =
  | ResolvedMedianObservation
  | ResolvedOperatorObservation;
