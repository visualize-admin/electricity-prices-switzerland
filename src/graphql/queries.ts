import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  WikiContentInfo: { input: any; output: any };
};

export enum CacheControlScope {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

export type Canton = {
  __typename: "Canton";
  id: Scalars["String"]["output"];
  municipalities: Array<Municipality>;
  name: Scalars["String"]["output"];
  operator: Array<Operator>;
};

export type CantonMedianObservation = {
  __typename: "CantonMedianObservation";
  canton: Scalars["String"]["output"];
  cantonLabel?: Maybe<Scalars["String"]["output"]>;
  category: Scalars["String"]["output"];
  period: Scalars["String"]["output"];
  value: Scalars["Float"]["output"];
};

export type CantonMedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type CantonResult = SearchResult & {
  __typename: "CantonResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type CubeHealth = {
  __typename: "CubeHealth";
  dimensions: Array<Scalars["String"]["output"]>;
  ok: Scalars["Boolean"]["output"];
};

export type Municipality = {
  __typename: "Municipality";
  canton: Canton;
  id: Scalars["String"]["output"];
  isAbolished?: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  operators: Array<Operator>;
};

export type MunicipalityResult = SearchResult & {
  __typename: "MunicipalityResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type Observation =
  | CantonMedianObservation
  | OperatorObservation
  | SwissMedianObservation;

export type ObservationFilters = {
  canton?: InputMaybe<Array<Scalars["String"]["input"]>>;
  category?: InputMaybe<Array<Scalars["String"]["input"]>>;
  municipality?: InputMaybe<Array<Scalars["String"]["input"]>>;
  operator?: InputMaybe<Array<Scalars["String"]["input"]>>;
  period?: InputMaybe<Array<Scalars["String"]["input"]>>;
  product?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export enum ObservationKind {
  Canton = "Canton",
  Municipality = "Municipality",
}

export type Operator = {
  __typename: "Operator";
  cantons: Array<Canton>;
  documents: Array<OperatorDocument>;
  geverDocuments: Array<OperatorDocument>;
  geverId?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["String"]["output"]>;
  municipalities: Array<Municipality>;
  name: Scalars["String"]["output"];
};

export type OperatorDocument = {
  __typename: "OperatorDocument";
  category?: Maybe<OperatorDocumentCategory>;
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
  year: Scalars["String"]["output"];
};

export enum OperatorDocumentCategory {
  AnnualReport = "ANNUAL_REPORT",
  FinancialStatement = "FINANCIAL_STATEMENT",
  Tariffs = "TARIFFS",
}

export type OperatorObservation = {
  __typename: "OperatorObservation";
  canton: Scalars["String"]["output"];
  cantonLabel?: Maybe<Scalars["String"]["output"]>;
  category: Scalars["String"]["output"];
  municipality: Scalars["String"]["output"];
  municipalityLabel?: Maybe<Scalars["String"]["output"]>;
  operator: Scalars["String"]["output"];
  operatorLabel?: Maybe<Scalars["String"]["output"]>;
  period: Scalars["String"]["output"];
  value: Scalars["Float"]["output"];
};

export type OperatorObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type OperatorResult = SearchResult & {
  __typename: "OperatorResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export enum PriceComponent {
  Aidfee = "aidfee",
  Charge = "charge",
  Energy = "energy",
  Fixcosts = "fixcosts",
  Fixcostspercent = "fixcostspercent",
  Gridusage = "gridusage",
  Total = "total",
}

export type Query = {
  __typename: "Query";
  allMunicipalities: Array<Municipality>;
  canton?: Maybe<Canton>;
  cantonMedianObservations?: Maybe<Array<CantonMedianObservation>>;
  cantons: Array<Canton>;
  cubeHealth?: Maybe<CubeHealth>;
  municipalities: Array<Municipality>;
  municipality?: Maybe<Municipality>;
  observations?: Maybe<Array<OperatorObservation>>;
  operator?: Maybe<Operator>;
  operators: Array<Operator>;
  search: Array<SearchResult>;
  searchCantons: Array<CantonResult>;
  searchMunicipalities: Array<MunicipalityResult>;
  searchOperators: Array<OperatorResult>;
  swissMedianObservations?: Maybe<Array<SwissMedianObservation>>;
  systemInfo: SystemInfo;
  wikiContent?: Maybe<WikiContent>;
};

export type QueryAllMunicipalitiesArgs = {
  locale: Scalars["String"]["input"];
};

export type QueryCantonArgs = {
  id: Scalars["String"]["input"];
  locale: Scalars["String"]["input"];
};

export type QueryCantonMedianObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]["input"]>;
  observationKind?: InputMaybe<ObservationKind>;
};

export type QueryCantonsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryMunicipalitiesArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryMunicipalityArgs = {
  id: Scalars["String"]["input"];
  locale: Scalars["String"]["input"];
};

export type QueryObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]["input"]>;
  observationKind?: InputMaybe<ObservationKind>;
};

export type QueryOperatorArgs = {
  geverId?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["String"]["input"];
  locale: Scalars["String"]["input"];
};

export type QueryOperatorsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySearchArgs = {
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySearchCantonsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySearchMunicipalitiesArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySearchOperatorsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySwissMedianObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryWikiContentArgs = {
  locale: Scalars["String"]["input"];
  slug: Scalars["String"]["input"];
};

export type SearchResult = {
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type SwissMedianObservation = {
  __typename: "SwissMedianObservation";
  category: Scalars["String"]["output"];
  period: Scalars["String"]["output"];
  value: Scalars["Float"]["output"];
};

export type SwissMedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type SystemInfo = {
  __typename: "SystemInfo";
  SPARQL_ENDPOINT: Scalars["String"]["output"];
  VERSION: Scalars["String"]["output"];
};

export type WikiContent = {
  __typename: "WikiContent";
  html: Scalars["String"]["output"];
  info?: Maybe<Scalars["WikiContentInfo"]["output"]>;
};

export type MunicipalitiesQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
  ids?: InputMaybe<
    Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
  >;
}>;

export type MunicipalitiesQuery = {
  __typename: "Query";
  municipalities: Array<{
    __typename: "MunicipalityResult";
    id: string;
    name: string;
  }>;
};

export type AllMunicipalitiesQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
}>;

export type AllMunicipalitiesQuery = {
  __typename: "Query";
  municipalities: Array<{
    __typename: "Municipality";
    id: string;
    name: string;
  }>;
};

export type OperatorsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
  ids?: InputMaybe<
    Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
  >;
}>;

export type OperatorsQuery = {
  __typename: "Query";
  operators: Array<{ __typename: "OperatorResult"; id: string; name: string }>;
};

export type CantonsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
  ids?: InputMaybe<
    Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
  >;
}>;

export type CantonsQuery = {
  __typename: "Query";
  cantons: Array<{ __typename: "CantonResult"; id: string; name: string }>;
};

export type SearchQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SearchQuery = {
  __typename: "Query";
  search: Array<
    | { __typename: "CantonResult"; id: string; name: string }
    | { __typename: "MunicipalityResult"; id: string; name: string }
    | { __typename: "OperatorResult"; id: string; name: string }
  >;
};

export type OperatorObservationFieldsFragment = {
  __typename: "OperatorObservation";
  period: string;
  municipality: string;
  municipalityLabel?: string | null;
  operator: string;
  operatorLabel?: string | null;
  canton: string;
  cantonLabel?: string | null;
  category: string;
  value: number;
};

export type CantonMedianObservationFieldsFragment = {
  __typename: "CantonMedianObservation";
  period: string;
  canton: string;
  cantonLabel?: string | null;
  category: string;
  value: number;
};

export type SwissMedianObservationFieldsFragment = {
  __typename: "SwissMedianObservation";
  period: string;
  category: string;
  value: number;
};

export type ObservationsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  priceComponent: PriceComponent;
  filters: ObservationFilters;
  observationKind?: InputMaybe<ObservationKind>;
}>;

export type ObservationsQuery = {
  __typename: "Query";
  observations?: Array<{
    __typename: "OperatorObservation";
    period: string;
    municipality: string;
    municipalityLabel?: string | null;
    operator: string;
    operatorLabel?: string | null;
    canton: string;
    cantonLabel?: string | null;
    category: string;
    value: number;
  }> | null;
  cantonMedianObservations?: Array<{
    __typename: "CantonMedianObservation";
    period: string;
    canton: string;
    cantonLabel?: string | null;
    category: string;
    value: number;
  }> | null;
  swissMedianObservations?: Array<{
    __typename: "SwissMedianObservation";
    period: string;
    category: string;
    value: number;
  }> | null;
};

export type OperatorObservationWithAllPriceComponentsFieldsFragment = {
  __typename: "OperatorObservation";
  period: string;
  municipality: string;
  municipalityLabel?: string | null;
  operator: string;
  operatorLabel?: string | null;
  category: string;
  aidfee: number;
  fixcosts: number;
  charge: number;
  gridusage: number;
  energy: number;
  fixcostspercent: number;
  total: number;
};

export type CantonMedianObservationWithAllPriceComponentsFieldsFragment = {
  __typename: "CantonMedianObservation";
  period: string;
  canton: string;
  cantonLabel?: string | null;
  category: string;
  aidfee: number;
  charge: number;
  gridusage: number;
  energy: number;
  total: number;
};

export type ObservationsWithAllPriceComponentsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  filters: ObservationFilters;
  observationKind?: InputMaybe<ObservationKind>;
}>;

export type ObservationsWithAllPriceComponentsQuery = {
  __typename: "Query";
  observations?: Array<{
    __typename: "OperatorObservation";
    period: string;
    municipality: string;
    municipalityLabel?: string | null;
    operator: string;
    operatorLabel?: string | null;
    category: string;
    aidfee: number;
    fixcosts: number;
    charge: number;
    gridusage: number;
    energy: number;
    fixcostspercent: number;
    total: number;
  }> | null;
  cantonMedianObservations?: Array<{
    __typename: "CantonMedianObservation";
    period: string;
    canton: string;
    cantonLabel?: string | null;
    category: string;
    aidfee: number;
    charge: number;
    gridusage: number;
    energy: number;
    total: number;
  }> | null;
};

export type OperatorDocumentsQueryVariables = Exact<{
  id: Scalars["String"]["input"];
  locale: Scalars["String"]["input"];
}>;

export type OperatorDocumentsQuery = {
  __typename: "Query";
  operator?: {
    __typename: "Operator";
    documents: Array<{
      __typename: "OperatorDocument";
      id: string;
      name: string;
      url: string;
      year: string;
      category?: OperatorDocumentCategory | null;
    }>;
    geverDocuments: Array<{
      __typename: "OperatorDocument";
      id: string;
      name: string;
      url: string;
      year: string;
      category?: OperatorDocumentCategory | null;
    }>;
  } | null;
};

export type WikiContentQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  slug: Scalars["String"]["input"];
}>;

export type WikiContentQuery = {
  __typename: "Query";
  wikiContent?: {
    __typename: "WikiContent";
    html: string;
    info?: any | null;
  } | null;
};

export type SystemInfoQueryVariables = Exact<{ [key: string]: never }>;

export type SystemInfoQuery = {
  __typename: "Query";
  systemInfo: {
    __typename: "SystemInfo";
    SPARQL_ENDPOINT: string;
    VERSION: string;
  };
};

export type CubeHealthQueryVariables = Exact<{ [key: string]: never }>;

export type CubeHealthQuery = {
  __typename: "Query";
  cubeHealth?: {
    __typename: "CubeHealth";
    ok: boolean;
    dimensions: Array<string>;
  } | null;
};

export const OperatorObservationFieldsFragmentDoc = gql`
  fragment operatorObservationFields on OperatorObservation {
    period
    municipality
    municipalityLabel
    operator
    operatorLabel
    canton
    cantonLabel
    category
    value(priceComponent: $priceComponent)
  }
`;
export const CantonMedianObservationFieldsFragmentDoc = gql`
  fragment cantonMedianObservationFields on CantonMedianObservation {
    period
    canton
    cantonLabel
    category
    value(priceComponent: $priceComponent)
  }
`;
export const SwissMedianObservationFieldsFragmentDoc = gql`
  fragment swissMedianObservationFields on SwissMedianObservation {
    period
    category
    value(priceComponent: $priceComponent)
  }
`;
export const OperatorObservationWithAllPriceComponentsFieldsFragmentDoc = gql`
  fragment operatorObservationWithAllPriceComponentsFields on OperatorObservation {
    period
    municipality
    municipalityLabel
    operator
    operatorLabel
    category
    aidfee: value(priceComponent: aidfee)
    fixcosts: value(priceComponent: fixcosts)
    charge: value(priceComponent: charge)
    gridusage: value(priceComponent: gridusage)
    energy: value(priceComponent: energy)
    fixcostspercent: value(priceComponent: fixcostspercent)
    total: value(priceComponent: total)
  }
`;
export const CantonMedianObservationWithAllPriceComponentsFieldsFragmentDoc = gql`
  fragment cantonMedianObservationWithAllPriceComponentsFields on CantonMedianObservation {
    period
    canton
    cantonLabel
    category
    aidfee: value(priceComponent: aidfee)
    charge: value(priceComponent: charge)
    gridusage: value(priceComponent: gridusage)
    energy: value(priceComponent: energy)
    total: value(priceComponent: total)
  }
`;
export const MunicipalitiesDocument = gql`
  query Municipalities($locale: String!, $query: String, $ids: [String!]) {
    municipalities: searchMunicipalities(
      locale: $locale
      query: $query
      ids: $ids
    ) {
      id
      name
    }
  }
`;

export function useMunicipalitiesQuery(
  options: Omit<Urql.UseQueryArgs<MunicipalitiesQueryVariables>, "query">
) {
  return Urql.useQuery<MunicipalitiesQuery, MunicipalitiesQueryVariables>({
    query: MunicipalitiesDocument,
    ...options,
  });
}
export const AllMunicipalitiesDocument = gql`
  query AllMunicipalities($locale: String!) {
    municipalities: allMunicipalities(locale: $locale) {
      id
      name
    }
  }
`;

export function useAllMunicipalitiesQuery(
  options: Omit<Urql.UseQueryArgs<AllMunicipalitiesQueryVariables>, "query">
) {
  return Urql.useQuery<AllMunicipalitiesQuery, AllMunicipalitiesQueryVariables>(
    { query: AllMunicipalitiesDocument, ...options }
  );
}
export const OperatorsDocument = gql`
  query Operators($locale: String!, $query: String, $ids: [String!]) {
    operators: searchOperators(locale: $locale, query: $query, ids: $ids) {
      id
      name
    }
  }
`;

export function useOperatorsQuery(
  options: Omit<Urql.UseQueryArgs<OperatorsQueryVariables>, "query">
) {
  return Urql.useQuery<OperatorsQuery, OperatorsQueryVariables>({
    query: OperatorsDocument,
    ...options,
  });
}
export const CantonsDocument = gql`
  query Cantons($locale: String!, $query: String, $ids: [String!]) {
    cantons: searchCantons(locale: $locale, query: $query, ids: $ids) {
      id
      name
    }
  }
`;

export function useCantonsQuery(
  options: Omit<Urql.UseQueryArgs<CantonsQueryVariables>, "query">
) {
  return Urql.useQuery<CantonsQuery, CantonsQueryVariables>({
    query: CantonsDocument,
    ...options,
  });
}
export const SearchDocument = gql`
  query Search($locale: String!, $query: String) {
    search(locale: $locale, query: $query) {
      id
      name
    }
  }
`;

export function useSearchQuery(
  options: Omit<Urql.UseQueryArgs<SearchQueryVariables>, "query">
) {
  return Urql.useQuery<SearchQuery, SearchQueryVariables>({
    query: SearchDocument,
    ...options,
  });
}
export const ObservationsDocument = gql`
  query Observations(
    $locale: String!
    $priceComponent: PriceComponent!
    $filters: ObservationFilters!
    $observationKind: ObservationKind
  ) {
    observations(
      locale: $locale
      filters: $filters
      observationKind: $observationKind
    ) {
      ...operatorObservationFields
    }
    cantonMedianObservations(
      locale: $locale
      filters: $filters
      observationKind: $observationKind
    ) {
      ...cantonMedianObservationFields
    }
    swissMedianObservations(locale: $locale, filters: $filters) {
      ...swissMedianObservationFields
    }
  }
  ${OperatorObservationFieldsFragmentDoc}
  ${CantonMedianObservationFieldsFragmentDoc}
  ${SwissMedianObservationFieldsFragmentDoc}
`;

export function useObservationsQuery(
  options: Omit<Urql.UseQueryArgs<ObservationsQueryVariables>, "query">
) {
  return Urql.useQuery<ObservationsQuery, ObservationsQueryVariables>({
    query: ObservationsDocument,
    ...options,
  });
}
export const ObservationsWithAllPriceComponentsDocument = gql`
  query ObservationsWithAllPriceComponents(
    $locale: String!
    $filters: ObservationFilters!
    $observationKind: ObservationKind
  ) {
    observations(
      locale: $locale
      filters: $filters
      observationKind: $observationKind
    ) {
      ...operatorObservationWithAllPriceComponentsFields
    }
    cantonMedianObservations(
      locale: $locale
      filters: $filters
      observationKind: $observationKind
    ) {
      ...cantonMedianObservationWithAllPriceComponentsFields
    }
  }
  ${OperatorObservationWithAllPriceComponentsFieldsFragmentDoc}
  ${CantonMedianObservationWithAllPriceComponentsFieldsFragmentDoc}
`;

export function useObservationsWithAllPriceComponentsQuery(
  options: Omit<
    Urql.UseQueryArgs<ObservationsWithAllPriceComponentsQueryVariables>,
    "query"
  >
) {
  return Urql.useQuery<
    ObservationsWithAllPriceComponentsQuery,
    ObservationsWithAllPriceComponentsQueryVariables
  >({ query: ObservationsWithAllPriceComponentsDocument, ...options });
}
export const OperatorDocumentsDocument = gql`
  query OperatorDocuments($id: String!, $locale: String!) {
    operator(id: $id, locale: $locale) {
      documents {
        id
        name
        url
        year
        category
      }
      geverDocuments {
        id
        name
        url
        year
        category
      }
    }
  }
`;

export function useOperatorDocumentsQuery(
  options: Omit<Urql.UseQueryArgs<OperatorDocumentsQueryVariables>, "query">
) {
  return Urql.useQuery<OperatorDocumentsQuery, OperatorDocumentsQueryVariables>(
    { query: OperatorDocumentsDocument, ...options }
  );
}
export const WikiContentDocument = gql`
  query WikiContent($locale: String!, $slug: String!) {
    wikiContent(locale: $locale, slug: $slug) {
      html
      info
    }
  }
`;

export function useWikiContentQuery(
  options: Omit<Urql.UseQueryArgs<WikiContentQueryVariables>, "query">
) {
  return Urql.useQuery<WikiContentQuery, WikiContentQueryVariables>({
    query: WikiContentDocument,
    ...options,
  });
}
export const SystemInfoDocument = gql`
  query SystemInfo {
    systemInfo {
      SPARQL_ENDPOINT
      VERSION
    }
  }
`;

export function useSystemInfoQuery(
  options?: Omit<Urql.UseQueryArgs<SystemInfoQueryVariables>, "query">
) {
  return Urql.useQuery<SystemInfoQuery, SystemInfoQueryVariables>({
    query: SystemInfoDocument,
    ...options,
  });
}
export const CubeHealthDocument = gql`
  query CubeHealth {
    cubeHealth {
      ok
      dimensions
    }
  }
`;

export function useCubeHealthQuery(
  options?: Omit<Urql.UseQueryArgs<CubeHealthQueryVariables>, "query">
) {
  return Urql.useQuery<CubeHealthQuery, CubeHealthQueryVariables>({
    query: CubeHealthDocument,
    ...options,
  });
}
