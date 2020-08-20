import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type PriceComponents = {
  __typename: 'PriceComponents';
  total: Scalars['Float'];
};

export type SearchResult = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type MunicipalityResult = SearchResult & {
  __typename: 'MunicipalityResult';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type OperatorResult = SearchResult & {
  __typename: 'OperatorResult';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type CantonResult = SearchResult & {
  __typename: 'CantonResult';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type Municipality = {
  __typename: 'Municipality';
  id: Scalars['String'];
  name: Scalars['String'];
  canton: Canton;
  operators: Array<Operator>;
  priceComponents: PriceComponents;
};

export type Operator = {
  __typename: 'Operator';
  id: Scalars['String'];
  name: Scalars['String'];
  municipalities: Array<Municipality>;
  priceComponents: PriceComponents;
};

export type Canton = {
  __typename: 'Canton';
  id: Scalars['String'];
  name: Scalars['String'];
  municipalities: Array<Municipality>;
  priceComponents: PriceComponents;
};

export type TemporalDimension = {
  __typename: 'TemporalDimension';
  iri: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  min: Scalars['String'];
  max: Scalars['String'];
};

export type OperatorObservation = {
  __typename: 'OperatorObservation';
  municipality: Scalars['String'];
  municipalityLabel?: Maybe<Scalars['String']>;
  operator: Scalars['String'];
  operatorLabel?: Maybe<Scalars['String']>;
  canton: Scalars['String'];
  cantonLabel?: Maybe<Scalars['String']>;
  category: Scalars['String'];
  period: Scalars['String'];
  value: Scalars['Float'];
};


export type OperatorObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type MedianObservation = {
  __typename: 'MedianObservation';
  canton: Scalars['String'];
  cantonLabel?: Maybe<Scalars['String']>;
  category: Scalars['String'];
  period: Scalars['String'];
  value: Scalars['Float'];
};


export type MedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type Observation = OperatorObservation | MedianObservation;

export type ObservationFilters = {
  period?: Maybe<Array<Scalars['String']>>;
  municipality?: Maybe<Array<Scalars['String']>>;
  canton?: Maybe<Array<Scalars['String']>>;
  operator?: Maybe<Array<Scalars['String']>>;
  category?: Maybe<Array<Scalars['String']>>;
  product?: Maybe<Array<Scalars['String']>>;
};

export enum PriceComponent {
  Aidfee = 'aidfee',
  Fixcosts = 'fixcosts',
  Charge = 'charge',
  Gridusage = 'gridusage',
  Energy = 'energy',
  Fixcostspercent = 'fixcostspercent',
  Total = 'total'
}

export enum ObservationType {
  MedianObservation = 'MedianObservation',
  OperatorObservation = 'OperatorObservation'
}

export type Query = {
  __typename: 'Query';
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  operators: Array<Operator>;
  search: Array<SearchResult>;
  municipality?: Maybe<Municipality>;
  canton?: Maybe<Canton>;
  operator?: Maybe<Operator>;
  observations: Array<Observation>;
};


export type QueryMunicipalitiesArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
};


export type QueryCantonsArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
};


export type QueryOperatorsArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
};


export type QuerySearchArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
};


export type QueryMunicipalityArgs = {
  locale?: Maybe<Scalars['String']>;
  id: Scalars['String'];
};


export type QueryCantonArgs = {
  locale?: Maybe<Scalars['String']>;
  id: Scalars['String'];
};


export type QueryOperatorArgs = {
  locale?: Maybe<Scalars['String']>;
  id: Scalars['String'];
};


export type QueryObservationsArgs = {
  locale?: Maybe<Scalars['String']>;
  filters?: Maybe<ObservationFilters>;
  observationType?: Maybe<ObservationType>;
};

export type MunicipalitiesQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
}>;


export type MunicipalitiesQuery = { __typename: 'Query', municipalities: Array<{ __typename: 'Municipality', id: string, name: string }> };

export type OperatorsQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
}>;


export type OperatorsQuery = { __typename: 'Query', operators: Array<{ __typename: 'Operator', id: string, name: string }> };

export type CantonsQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
}>;


export type CantonsQuery = { __typename: 'Query', cantons: Array<{ __typename: 'Canton', id: string, name: string }> };

export type SearchQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
}>;


export type SearchQuery = { __typename: 'Query', search: Array<{ __typename: 'MunicipalityResult', id: string, name: string } | { __typename: 'OperatorResult', id: string, name: string } | { __typename: 'CantonResult', id: string, name: string }> };

export type OperatorObservationFieldsFragment = { __typename: 'OperatorObservation', period: string, municipality: string, municipalityLabel?: Maybe<string>, operator: string, operatorLabel?: Maybe<string>, canton: string, cantonLabel?: Maybe<string>, category: string, value: number };

export type MedianObservationFieldsFragment = { __typename: 'MedianObservation', period: string, canton: string, cantonLabel?: Maybe<string>, category: string, value: number };

export type ObservationsQueryVariables = Exact<{
  locale?: Maybe<Scalars['String']>;
  priceComponent: PriceComponent;
  filters: ObservationFilters;
  observationType?: Maybe<ObservationType>;
}>;


export type ObservationsQuery = { __typename: 'Query', observations: Array<(
    { __typename: 'OperatorObservation' }
    & OperatorObservationFieldsFragment
  ) | (
    { __typename: 'MedianObservation' }
    & MedianObservationFieldsFragment
  )> };

export type OperatorObservationWithAllPriceComponentsFieldsFragment = { __typename: 'OperatorObservation', period: string, municipality: string, municipalityLabel?: Maybe<string>, operator: string, operatorLabel?: Maybe<string>, category: string, aidfee: number, fixcosts: number, charge: number, gridusage: number, energy: number, fixcostspercent: number, total: number };

export type MedianObservationWithAllPriceComponentsFieldsFragment = { __typename: 'MedianObservation', period: string, canton: string, cantonLabel?: Maybe<string>, category: string, aidfee: number, charge: number, gridusage: number, energy: number, total: number };

export type ObservationsWithAllPriceComponentsQueryVariables = Exact<{
  locale?: Maybe<Scalars['String']>;
  filters: ObservationFilters;
  observationType?: Maybe<ObservationType>;
}>;


export type ObservationsWithAllPriceComponentsQuery = { __typename: 'Query', observations: Array<(
    { __typename: 'OperatorObservation' }
    & OperatorObservationWithAllPriceComponentsFieldsFragment
  ) | (
    { __typename: 'MedianObservation' }
    & MedianObservationWithAllPriceComponentsFieldsFragment
  )> };

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
export const MedianObservationFieldsFragmentDoc = gql`
    fragment medianObservationFields on MedianObservation {
  period
  canton
  cantonLabel
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
export const MedianObservationWithAllPriceComponentsFieldsFragmentDoc = gql`
    fragment medianObservationWithAllPriceComponentsFields on MedianObservation {
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
  municipalities(locale: $locale, query: $query, ids: $ids) {
    id
    name
  }
}
    `;

export function useMunicipalitiesQuery(options: Omit<Urql.UseQueryArgs<MunicipalitiesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MunicipalitiesQuery>({ query: MunicipalitiesDocument, ...options });
};
export const OperatorsDocument = gql`
    query Operators($locale: String!, $query: String, $ids: [String!]) {
  operators(locale: $locale, query: $query, ids: $ids) {
    id
    name
  }
}
    `;

export function useOperatorsQuery(options: Omit<Urql.UseQueryArgs<OperatorsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<OperatorsQuery>({ query: OperatorsDocument, ...options });
};
export const CantonsDocument = gql`
    query Cantons($locale: String!, $query: String, $ids: [String!]) {
  cantons(locale: $locale, query: $query, ids: $ids) {
    id
    name
  }
}
    `;

export function useCantonsQuery(options: Omit<Urql.UseQueryArgs<CantonsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<CantonsQuery>({ query: CantonsDocument, ...options });
};
export const SearchDocument = gql`
    query Search($locale: String!, $query: String) {
  search(locale: $locale, query: $query) {
    id
    name
  }
}
    `;

export function useSearchQuery(options: Omit<Urql.UseQueryArgs<SearchQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<SearchQuery>({ query: SearchDocument, ...options });
};
export const ObservationsDocument = gql`
    query Observations($locale: String, $priceComponent: PriceComponent!, $filters: ObservationFilters!, $observationType: ObservationType) {
  observations(locale: $locale, filters: $filters, observationType: $observationType) {
    ... on OperatorObservation {
      ...operatorObservationFields
    }
    ... on MedianObservation {
      ...medianObservationFields
    }
  }
}
    ${OperatorObservationFieldsFragmentDoc}
${MedianObservationFieldsFragmentDoc}`;

export function useObservationsQuery(options: Omit<Urql.UseQueryArgs<ObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ObservationsQuery>({ query: ObservationsDocument, ...options });
};
export const ObservationsWithAllPriceComponentsDocument = gql`
    query ObservationsWithAllPriceComponents($locale: String, $filters: ObservationFilters!, $observationType: ObservationType) {
  observations(locale: $locale, filters: $filters, observationType: $observationType) {
    ... on OperatorObservation {
      ...operatorObservationWithAllPriceComponentsFields
    }
    ... on MedianObservation {
      ...medianObservationWithAllPriceComponentsFields
    }
  }
}
    ${OperatorObservationWithAllPriceComponentsFieldsFragmentDoc}
${MedianObservationWithAllPriceComponentsFieldsFragmentDoc}`;

export function useObservationsWithAllPriceComponentsQuery(options: Omit<Urql.UseQueryArgs<ObservationsWithAllPriceComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ObservationsWithAllPriceComponentsQuery>({ query: ObservationsWithAllPriceComponentsDocument, ...options });
};