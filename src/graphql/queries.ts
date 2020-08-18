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

export type ProviderResult = SearchResult & {
  __typename: 'ProviderResult';
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
  providers: Array<Provider>;
  priceComponents: PriceComponents;
};

export type Provider = {
  __typename: 'Provider';
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

export type ProviderObservation = {
  __typename: 'ProviderObservation';
  municipality: Scalars['String'];
  municipalityLabel?: Maybe<Scalars['String']>;
  provider: Scalars['String'];
  providerLabel?: Maybe<Scalars['String']>;
  category: Scalars['String'];
  period: Scalars['String'];
  value: Scalars['Float'];
};


export type ProviderObservationValueArgs = {
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

export type Observation = ProviderObservation | MedianObservation;

export type ObservationFilters = {
  period?: Maybe<Array<Scalars['String']>>;
  municipality?: Maybe<Array<Scalars['String']>>;
  canton?: Maybe<Array<Scalars['String']>>;
  provider?: Maybe<Array<Scalars['String']>>;
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

export type Query = {
  __typename: 'Query';
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  providers: Array<Provider>;
  search: Array<SearchResult>;
  municipality?: Maybe<Municipality>;
  canton?: Maybe<Canton>;
  provider?: Maybe<Provider>;
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


export type QueryProvidersArgs = {
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


export type QueryProviderArgs = {
  locale?: Maybe<Scalars['String']>;
  id: Scalars['String'];
};


export type QueryObservationsArgs = {
  locale?: Maybe<Scalars['String']>;
  filters?: Maybe<ObservationFilters>;
};

export type MunicipalitiesQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
}>;


export type MunicipalitiesQuery = { __typename: 'Query', municipalities: Array<{ __typename: 'Municipality', id: string, name: string }> };

export type ProvidersQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
}>;


export type ProvidersQuery = { __typename: 'Query', providers: Array<{ __typename: 'Provider', id: string, name: string }> };

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


export type SearchQuery = { __typename: 'Query', providers: Array<{ __typename: 'Provider', id: string, name: string }> };

export type ProviderObservationFieldsFragment = { __typename: 'ProviderObservation', period: string, municipality: string, municipalityLabel?: Maybe<string>, provider: string, providerLabel?: Maybe<string>, category: string, value: number };

export type MedianObservationFieldsFragment = { __typename: 'MedianObservation', period: string, canton: string, cantonLabel?: Maybe<string>, category: string, value: number };

export type ObservationsQueryVariables = Exact<{
  locale?: Maybe<Scalars['String']>;
  priceComponent: PriceComponent;
  filters: ObservationFilters;
}>;


export type ObservationsQuery = { __typename: 'Query', observations: Array<(
    { __typename: 'ProviderObservation' }
    & ProviderObservationFieldsFragment
  ) | (
    { __typename: 'MedianObservation' }
    & MedianObservationFieldsFragment
  )> };

export type ProviderObservationWithAllPriceComponentsFieldsFragment = { __typename: 'ProviderObservation', period: string, municipality: string, municipalityLabel?: Maybe<string>, provider: string, providerLabel?: Maybe<string>, category: string, aidfee: number, fixcosts: number, charge: number, gridusage: number, energy: number, fixcostspercent: number, total: number };

export type MedianObservationWithAllPriceComponentsFieldsFragment = { __typename: 'MedianObservation', period: string, canton: string, cantonLabel?: Maybe<string>, category: string, aidfee: number, charge: number, gridusage: number, energy: number, total: number };

export type ObservationsWithAllPriceComponentsQueryVariables = Exact<{
  locale?: Maybe<Scalars['String']>;
  filters: ObservationFilters;
}>;


export type ObservationsWithAllPriceComponentsQuery = { __typename: 'Query', observations: Array<(
    { __typename: 'ProviderObservation' }
    & ProviderObservationWithAllPriceComponentsFieldsFragment
  ) | (
    { __typename: 'MedianObservation' }
    & MedianObservationWithAllPriceComponentsFieldsFragment
  )> };

export const ProviderObservationFieldsFragmentDoc = gql`
    fragment providerObservationFields on ProviderObservation {
  period
  municipality
  municipalityLabel
  provider
  providerLabel
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
export const ProviderObservationWithAllPriceComponentsFieldsFragmentDoc = gql`
    fragment providerObservationWithAllPriceComponentsFields on ProviderObservation {
  period
  municipality
  municipalityLabel
  provider
  providerLabel
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
export const ProvidersDocument = gql`
    query Providers($locale: String!, $query: String, $ids: [String!]) {
  providers(locale: $locale, query: $query, ids: $ids) {
    id
    name
  }
}
    `;

export function useProvidersQuery(options: Omit<Urql.UseQueryArgs<ProvidersQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ProvidersQuery>({ query: ProvidersDocument, ...options });
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
  providers(locale: $locale, query: $query) {
    id
    name
  }
}
    `;

export function useSearchQuery(options: Omit<Urql.UseQueryArgs<SearchQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<SearchQuery>({ query: SearchDocument, ...options });
};
export const ObservationsDocument = gql`
    query Observations($locale: String, $priceComponent: PriceComponent!, $filters: ObservationFilters!) {
  observations(locale: $locale, filters: $filters) {
    ... on ProviderObservation {
      ...providerObservationFields
    }
    ... on MedianObservation {
      ...medianObservationFields
    }
  }
}
    ${ProviderObservationFieldsFragmentDoc}
${MedianObservationFieldsFragmentDoc}`;

export function useObservationsQuery(options: Omit<Urql.UseQueryArgs<ObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ObservationsQuery>({ query: ObservationsDocument, ...options });
};
export const ObservationsWithAllPriceComponentsDocument = gql`
    query ObservationsWithAllPriceComponents($locale: String, $filters: ObservationFilters!) {
  observations(locale: $locale, filters: $filters) {
    ... on ProviderObservation {
      ...providerObservationWithAllPriceComponentsFields
    }
    ... on MedianObservation {
      ...medianObservationWithAllPriceComponentsFields
    }
  }
}
    ${ProviderObservationWithAllPriceComponentsFieldsFragmentDoc}
${MedianObservationWithAllPriceComponentsFieldsFragmentDoc}`;

export function useObservationsWithAllPriceComponentsQuery(options: Omit<Urql.UseQueryArgs<ObservationsWithAllPriceComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ObservationsWithAllPriceComponentsQuery>({ query: ObservationsWithAllPriceComponentsDocument, ...options });
};