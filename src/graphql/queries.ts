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

export type Municipality = {
  __typename: 'Municipality';
  name?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename: 'Query';
  municipalities: Array<Municipality>;
};


export type QueryMunicipalitiesArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
};

export type MunicipalitiesQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
}>;


export type MunicipalitiesQuery = { __typename: 'Query', municipalities: Array<{ __typename: 'Municipality', name?: Maybe<string> }> };


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