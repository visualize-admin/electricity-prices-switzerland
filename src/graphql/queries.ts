import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
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

export type Observation = {
  __typename: 'Observation';
  municipality: Scalars['String'];
  municipalityLabel?: Maybe<Scalars['String']>;
  provider: Scalars['String'];
  providerLabel?: Maybe<Scalars['String']>;
  category: Scalars['String'];
  period: Scalars['String'];
  value: Scalars['Float'];
};


export type ObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type ObservationFilters = {
  period?: Maybe<Array<Scalars['String']>>;
  municipality?: Maybe<Array<Scalars['String']>>;
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

export type Cube = {
  __typename: 'Cube';
  name: Scalars['String'];
  iri: Scalars['String'];
  dimensionPeriod?: Maybe<TemporalDimension>;
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  providers: Array<Provider>;
  municipality?: Maybe<Municipality>;
  canton?: Maybe<Canton>;
  provider?: Maybe<Provider>;
  observations: Array<Observation>;
};


export type CubeMunicipalitiesArgs = {
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
};


export type CubeCantonsArgs = {
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
};


export type CubeProvidersArgs = {
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
};


export type CubeMunicipalityArgs = {
  id: Scalars['String'];
};


export type CubeCantonArgs = {
  id: Scalars['String'];
};


export type CubeProviderArgs = {
  id: Scalars['String'];
};


export type CubeObservationsArgs = {
  filters?: Maybe<ObservationFilters>;
};

export type Query = {
  __typename: 'Query';
  cubes: Array<Cube>;
  cubeByIri?: Maybe<Cube>;
};


export type QueryCubesArgs = {
  locale?: Maybe<Scalars['String']>;
};


export type QueryCubeByIriArgs = {
  iri: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
};

export type MunicipalitiesQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
}>;


export type MunicipalitiesQuery = { __typename: 'Query', cubeByIri?: Maybe<{ __typename: 'Cube', municipalities: Array<{ __typename: 'Municipality', id: string, name: string }> }> };

export type ProvidersQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  ids?: Maybe<Array<Scalars['String']>>;
}>;


export type ProvidersQuery = { __typename: 'Query', cubeByIri?: Maybe<{ __typename: 'Cube', providers: Array<{ __typename: 'Provider', id: string, name: string }> }> };

export type ObservationsQueryVariables = Exact<{
  locale?: Maybe<Scalars['String']>;
  priceComponent: PriceComponent;
  filters: ObservationFilters;
}>;


export type ObservationsQuery = { __typename: 'Query', cubeByIri?: Maybe<{ __typename: 'Cube', observations: Array<{ __typename: 'Observation', period: string, municipality: string, municipalityLabel?: Maybe<string>, provider: string, providerLabel?: Maybe<string>, category: string, value: number }> }> };

export type ObservationsWithAllPriceComponentsQueryVariables = Exact<{
  locale?: Maybe<Scalars['String']>;
  filters: ObservationFilters;
}>;


export type ObservationsWithAllPriceComponentsQuery = { __typename: 'Query', cubeByIri?: Maybe<{ __typename: 'Cube', observations: Array<{ __typename: 'Observation', period: string, municipality: string, municipalityLabel?: Maybe<string>, provider: string, providerLabel?: Maybe<string>, category: string, aidfee: number, fixcosts: number, charge: number, gridusage: number, energy: number, fixcostspercent: number, total: number }> }> };


export const MunicipalitiesDocument = gql`
    query Municipalities($locale: String!, $query: String, $ids: [String!]) {
  cubeByIri(iri: "https://energy.ld.admin.ch/elcom/energy-pricing/cube", locale: $locale) {
    municipalities(query: $query, ids: $ids) {
      id
      name
    }
  }
}
    `;

export function useMunicipalitiesQuery(options: Omit<Urql.UseQueryArgs<MunicipalitiesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MunicipalitiesQuery>({ query: MunicipalitiesDocument, ...options });
};
export const ProvidersDocument = gql`
    query Providers($locale: String!, $query: String, $ids: [String!]) {
  cubeByIri(iri: "https://energy.ld.admin.ch/elcom/energy-pricing/cube", locale: $locale) {
    providers(query: $query, ids: $ids) {
      id
      name
    }
  }
}
    `;

export function useProvidersQuery(options: Omit<Urql.UseQueryArgs<ProvidersQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ProvidersQuery>({ query: ProvidersDocument, ...options });
};
export const ObservationsDocument = gql`
    query Observations($locale: String, $priceComponent: PriceComponent!, $filters: ObservationFilters!) {
  cubeByIri(iri: "https://energy.ld.admin.ch/elcom/energy-pricing/cube", locale: $locale) {
    observations(filters: $filters) {
      period
      municipality
      municipalityLabel
      provider
      providerLabel
      category
      value(priceComponent: $priceComponent)
    }
  }
}
    `;

export function useObservationsQuery(options: Omit<Urql.UseQueryArgs<ObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ObservationsQuery>({ query: ObservationsDocument, ...options });
};
export const ObservationsWithAllPriceComponentsDocument = gql`
    query ObservationsWithAllPriceComponents($locale: String, $filters: ObservationFilters!) {
  cubeByIri(iri: "https://energy.ld.admin.ch/elcom/energy-pricing/cube", locale: $locale) {
    observations(filters: $filters) {
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
  }
}
    `;

export function useObservationsWithAllPriceComponentsQuery(options: Omit<Urql.UseQueryArgs<ObservationsWithAllPriceComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ObservationsWithAllPriceComponentsQuery>({ query: ObservationsWithAllPriceComponentsDocument, ...options });
};