import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Canton = {
  __typename: "Canton";
  id: Scalars["String"];
  name: Scalars["String"];
  municipalities: Array<Municipality>;
  operator: Array<Operator>;
};

export type CantonMedianObservation = {
  __typename: "CantonMedianObservation";
  canton: Scalars["String"];
  cantonLabel?: Maybe<Scalars["String"]>;
  category: Scalars["String"];
  period: Scalars["String"];
  value: Scalars["Float"];
};

export type CantonMedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type CantonResult = SearchResult & {
  __typename: "CantonResult";
  id: Scalars["String"];
  name: Scalars["String"];
};

export type Municipality = {
  __typename: "Municipality";
  id: Scalars["String"];
  name: Scalars["String"];
  canton: Canton;
  operators: Array<Operator>;
};

export type MunicipalityResult = SearchResult & {
  __typename: "MunicipalityResult";
  id: Scalars["String"];
  name: Scalars["String"];
};

export type Observation =
  | OperatorObservation
  | CantonMedianObservation
  | SwissMedianObservation;

export type ObservationFilters = {
  period?: Maybe<Array<Scalars["String"]>>;
  municipality?: Maybe<Array<Scalars["String"]>>;
  canton?: Maybe<Array<Scalars["String"]>>;
  operator?: Maybe<Array<Scalars["String"]>>;
  category?: Maybe<Array<Scalars["String"]>>;
  product?: Maybe<Array<Scalars["String"]>>;
};

export enum ObservationKind {
  Canton = "Canton",
  Municipality = "Municipality",
}

export type Operator = {
  __typename: "Operator";
  id: Scalars["String"];
  name: Scalars["String"];
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  documents: Array<OperatorDocument>;
};

export type OperatorDocument = {
  __typename: "OperatorDocument";
  id: Scalars["String"];
  name: Scalars["String"];
  url: Scalars["String"];
  year: Scalars["String"];
  category?: Maybe<OperatorDocumentCategory>;
};

export enum OperatorDocumentCategory {
  Tariffs = "TARIFFS",
  FinancialStatement = "FINANCIAL_STATEMENT",
  AnnualReport = "ANNUAL_REPORT",
}

export type OperatorObservation = {
  __typename: "OperatorObservation";
  municipality: Scalars["String"];
  municipalityLabel?: Maybe<Scalars["String"]>;
  operator: Scalars["String"];
  operatorLabel?: Maybe<Scalars["String"]>;
  canton: Scalars["String"];
  cantonLabel?: Maybe<Scalars["String"]>;
  category: Scalars["String"];
  period: Scalars["String"];
  value: Scalars["Float"];
};

export type OperatorObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type OperatorResult = SearchResult & {
  __typename: "OperatorResult";
  id: Scalars["String"];
  name: Scalars["String"];
};

export enum PriceComponent {
  Aidfee = "aidfee",
  Fixcosts = "fixcosts",
  Charge = "charge",
  Gridusage = "gridusage",
  Energy = "energy",
  Fixcostspercent = "fixcostspercent",
  Total = "total",
}

export type Query = {
  __typename: "Query";
  systemInfo: SystemInfo;
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  operators: Array<Operator>;
  search: Array<SearchResult>;
  searchMunicipalities: Array<MunicipalityResult>;
  searchCantons: Array<CantonResult>;
  searchOperators: Array<OperatorResult>;
  municipality?: Maybe<Municipality>;
  canton?: Maybe<Canton>;
  operator?: Maybe<Operator>;
  observations?: Maybe<Array<OperatorObservation>>;
  cantonMedianObservations?: Maybe<Array<CantonMedianObservation>>;
  swissMedianObservations?: Maybe<Array<SwissMedianObservation>>;
  wikiContent?: Maybe<WikiContent>;
};

export type QueryMunicipalitiesArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QueryCantonsArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QueryOperatorsArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QuerySearchArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
};

export type QuerySearchMunicipalitiesArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QuerySearchCantonsArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QuerySearchOperatorsArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QueryMunicipalityArgs = {
  locale: Scalars["String"];
  id: Scalars["String"];
};

export type QueryCantonArgs = {
  locale: Scalars["String"];
  id: Scalars["String"];
};

export type QueryOperatorArgs = {
  locale: Scalars["String"];
  id: Scalars["String"];
};

export type QueryObservationsArgs = {
  locale?: Maybe<Scalars["String"]>;
  filters?: Maybe<ObservationFilters>;
  observationKind?: Maybe<ObservationKind>;
};

export type QueryCantonMedianObservationsArgs = {
  locale?: Maybe<Scalars["String"]>;
  filters?: Maybe<ObservationFilters>;
  observationKind?: Maybe<ObservationKind>;
};

export type QuerySwissMedianObservationsArgs = {
  locale?: Maybe<Scalars["String"]>;
  filters?: Maybe<ObservationFilters>;
};

export type QueryWikiContentArgs = {
  locale: Scalars["String"];
  slug: Scalars["String"];
};

export type SearchResult = {
  id: Scalars["String"];
  name: Scalars["String"];
};

export type SwissMedianObservation = {
  __typename: "SwissMedianObservation";
  category: Scalars["String"];
  period: Scalars["String"];
  value: Scalars["Float"];
};

export type SwissMedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type SystemInfo = {
  __typename: "SystemInfo";
  SPARQL_ENDPOINT: Scalars["String"];
  VERSION: Scalars["String"];
};

export type WikiContent = {
  __typename: "WikiContent";
  html: Scalars["String"];
};

export type MunicipalitiesQueryVariables = Exact<{
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]> | Scalars["String"]>;
}>;

export type MunicipalitiesQuery = {
  __typename: "Query";
  municipalities: Array<{
    __typename: "MunicipalityResult";
    id: string;
    name: string;
  }>;
};

export type OperatorsQueryVariables = Exact<{
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]> | Scalars["String"]>;
}>;

export type OperatorsQuery = {
  __typename: "Query";
  operators: Array<{ __typename: "OperatorResult"; id: string; name: string }>;
};

export type CantonsQueryVariables = Exact<{
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]> | Scalars["String"]>;
}>;

export type CantonsQuery = {
  __typename: "Query";
  cantons: Array<{ __typename: "CantonResult"; id: string; name: string }>;
};

export type SearchQueryVariables = Exact<{
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
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
  municipalityLabel?: Maybe<string>;
  operator: string;
  operatorLabel?: Maybe<string>;
  canton: string;
  cantonLabel?: Maybe<string>;
  category: string;
  value: number;
};

export type CantonMedianObservationFieldsFragment = {
  __typename: "CantonMedianObservation";
  period: string;
  canton: string;
  cantonLabel?: Maybe<string>;
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
  locale: Scalars["String"];
  priceComponent: PriceComponent;
  filters: ObservationFilters;
  observationKind?: Maybe<ObservationKind>;
}>;

export type ObservationsQuery = {
  __typename: "Query";
  observations?: Maybe<
    Array<
      { __typename: "OperatorObservation" } & OperatorObservationFieldsFragment
    >
  >;
  cantonMedianObservations?: Maybe<
    Array<
      {
        __typename: "CantonMedianObservation";
      } & CantonMedianObservationFieldsFragment
    >
  >;
  swissMedianObservations?: Maybe<
    Array<
      {
        __typename: "SwissMedianObservation";
      } & SwissMedianObservationFieldsFragment
    >
  >;
};

export type OperatorObservationWithAllPriceComponentsFieldsFragment = {
  __typename: "OperatorObservation";
  period: string;
  municipality: string;
  municipalityLabel?: Maybe<string>;
  operator: string;
  operatorLabel?: Maybe<string>;
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
  cantonLabel?: Maybe<string>;
  category: string;
  aidfee: number;
  charge: number;
  gridusage: number;
  energy: number;
  total: number;
};

export type ObservationsWithAllPriceComponentsQueryVariables = Exact<{
  locale: Scalars["String"];
  filters: ObservationFilters;
  observationKind?: Maybe<ObservationKind>;
}>;

export type ObservationsWithAllPriceComponentsQuery = {
  __typename: "Query";
  observations?: Maybe<
    Array<
      {
        __typename: "OperatorObservation";
      } & OperatorObservationWithAllPriceComponentsFieldsFragment
    >
  >;
  cantonMedianObservations?: Maybe<
    Array<
      {
        __typename: "CantonMedianObservation";
      } & CantonMedianObservationWithAllPriceComponentsFieldsFragment
    >
  >;
};

export type OperatorDocumentsQueryVariables = Exact<{
  id: Scalars["String"];
  locale: Scalars["String"];
}>;

export type OperatorDocumentsQuery = {
  __typename: "Query";
  operator?: Maybe<{
    __typename: "Operator";
    documents: Array<{
      __typename: "OperatorDocument";
      id: string;
      name: string;
      url: string;
      year: string;
      category?: Maybe<OperatorDocumentCategory>;
    }>;
  }>;
};

export type WikiContentQueryVariables = Exact<{
  locale: Scalars["String"];
  slug: Scalars["String"];
}>;

export type WikiContentQuery = {
  __typename: "Query";
  wikiContent?: Maybe<{ __typename: "WikiContent"; html: string }>;
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
  options: Omit<Urql.UseQueryArgs<MunicipalitiesQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<MunicipalitiesQuery>({
    query: MunicipalitiesDocument,
    ...options,
  });
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
  options: Omit<Urql.UseQueryArgs<OperatorsQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<OperatorsQuery>({
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
  options: Omit<Urql.UseQueryArgs<CantonsQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<CantonsQuery>({ query: CantonsDocument, ...options });
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
  options: Omit<Urql.UseQueryArgs<SearchQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<SearchQuery>({ query: SearchDocument, ...options });
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
  options: Omit<Urql.UseQueryArgs<ObservationsQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<ObservationsQuery>({
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
  > = {}
) {
  return Urql.useQuery<ObservationsWithAllPriceComponentsQuery>({
    query: ObservationsWithAllPriceComponentsDocument,
    ...options,
  });
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
    }
  }
`;

export function useOperatorDocumentsQuery(
  options: Omit<
    Urql.UseQueryArgs<OperatorDocumentsQueryVariables>,
    "query"
  > = {}
) {
  return Urql.useQuery<OperatorDocumentsQuery>({
    query: OperatorDocumentsDocument,
    ...options,
  });
}
export const WikiContentDocument = gql`
  query WikiContent($locale: String!, $slug: String!) {
    wikiContent(locale: $locale, slug: $slug) {
      html
    }
  }
`;

export function useWikiContentQuery(
  options: Omit<Urql.UseQueryArgs<WikiContentQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<WikiContentQuery>({
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
  options: Omit<Urql.UseQueryArgs<SystemInfoQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<SystemInfoQuery>({
    query: SystemInfoDocument,
    ...options,
  });
}
