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
  name: Scalars['String'];
  canton: Canton;
  providers: Array<Provider>;
  priceComponents: PriceComponents;
};

export type Provider = {
  __typename: 'Provider';
  name: Scalars['String'];
  municipalities: Array<Municipality>;
  priceComponents: PriceComponents;
};

export type Canton = {
  __typename: 'Canton';
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
  provider: Scalars['String'];
  category: Scalars['String'];
  period: Scalars['String'];
  aidfee: Scalars['Float'];
  fixcosts: Scalars['Float'];
  charge: Scalars['Float'];
  gridusage: Scalars['Float'];
  energy: Scalars['Float'];
  fixcostspercent: Scalars['Float'];
};

export type ObservationFilters = {
  period?: Maybe<Array<Maybe<Scalars['String']>>>;
  municipality?: Maybe<Array<Maybe<Scalars['String']>>>;
  provider?: Maybe<Array<Maybe<Scalars['String']>>>;
  category?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type Cube = {
  __typename: 'Cube';
  name: Scalars['String'];
  iri: Scalars['String'];
  dimensionPeriod?: Maybe<TemporalDimension>;
  observations: Array<Observation>;
};


export type CubeObservationsArgs = {
  filters?: Maybe<ObservationFilters>;
};

export type Query = {
  __typename: 'Query';
  cubes: Array<Cube>;
  cubeByIri?: Maybe<Cube>;
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  providers: Array<Provider>;
  municipality?: Maybe<Municipality>;
  canton?: Maybe<Canton>;
  provider?: Maybe<Provider>;
};


export type QueryCubesArgs = {
  locale?: Maybe<Scalars['String']>;
};


export type QueryCubeByIriArgs = {
  iri: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
};


export type QueryMunicipalitiesArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
};


export type QueryCantonsArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
};


export type QueryProvidersArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
};


export type QueryMunicipalityArgs = {
  id: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
};


export type QueryCantonArgs = {
  id: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
};


export type QueryProviderArgs = {
  id: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
};

export type MunicipalitiesQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
}>;


export type MunicipalitiesQuery = { __typename: 'Query', municipalities: Array<{ __typename: 'Municipality', name: string }> };


export const MunicipalitiesDocument = gql`
    query Municipalities($locale: String!, $query: String) {
  municipalities(locale: $locale, query: $query) {
    name
  }
}
    `;

export function useMunicipalitiesQuery(options: Omit<Urql.UseQueryArgs<MunicipalitiesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MunicipalitiesQuery>({ query: MunicipalitiesDocument, ...options });
};