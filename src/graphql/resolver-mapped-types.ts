/**
 * This file contains types that are specific to the GraphQL resolvers implementation.
 *
 * They are returned by parent resolvers to pass on more fields than specified in the GraphQL schema to field resolvers.
 * E.g. a top-level query will pass a View and Source to field resolvers
 *
 */

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
  geverId?: string;
  // view: View;
  // source: Source;
};
export type ResolvedCanton = { id: string };

export type ResolvedCantonMedianObservation = {
  __typename: "CantonMedianObservation";
  category?: string;
  period?: string;
  region?: string;
  regionLabel?: string;
} & { [key: string]: number };

export type ResolvedSwissMedianObservation = {
  __typename: "SwissMedianObservation";
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
  | ResolvedCantonMedianObservation
  | ResolvedSwissMedianObservation
  | ResolvedOperatorObservation;

export { type TariffCategory } from "src/domain/data";
