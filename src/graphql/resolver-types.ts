import { GraphQLResolveInfo } from 'graphql';
import { ResolvedCanton, ResolvedMunicipality, ResolvedProvider, ResolvedObservation, ResolvedSearchResult } from './shared-types';
import { ServerContext } from './server-context';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type PriceComponents = {
  __typename?: 'PriceComponents';
  total: Scalars['Float'];
};

export type SearchResult = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type MunicipalityResult = SearchResult & {
  __typename?: 'MunicipalityResult';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type ProviderResult = SearchResult & {
  __typename?: 'ProviderResult';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type CantonResult = SearchResult & {
  __typename?: 'CantonResult';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type Municipality = {
  __typename?: 'Municipality';
  id: Scalars['String'];
  name: Scalars['String'];
  canton: Canton;
  providers: Array<Provider>;
  priceComponents: PriceComponents;
};

export type Provider = {
  __typename?: 'Provider';
  id: Scalars['String'];
  name: Scalars['String'];
  municipalities: Array<Municipality>;
  priceComponents: PriceComponents;
};

export type Canton = {
  __typename?: 'Canton';
  id: Scalars['String'];
  name: Scalars['String'];
  municipalities: Array<Municipality>;
  priceComponents: PriceComponents;
};

export type TemporalDimension = {
  __typename?: 'TemporalDimension';
  iri: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  min: Scalars['String'];
  max: Scalars['String'];
};

export type Observation = {
  __typename?: 'Observation';
  municipality: Scalars['String'];
  municipalityLabel?: Maybe<Scalars['String']>;
  provider: Scalars['String'];
  providerLabel?: Maybe<Scalars['String']>;
  canton?: Maybe<Scalars['String']>;
  cantonLabel?: Maybe<Scalars['String']>;
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

export type CantonObservationFilters = {
  period?: Maybe<Array<Scalars['String']>>;
  canton?: Maybe<Array<Scalars['String']>>;
  provider?: Maybe<Array<Scalars['String']>>;
  category?: Maybe<Array<Scalars['String']>>;
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
  __typename?: 'Query';
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  providers: Array<Provider>;
  search: Array<SearchResult>;
  municipality?: Maybe<Municipality>;
  canton?: Maybe<Canton>;
  provider?: Maybe<Provider>;
  observations: Array<Observation>;
  cantonObservations: Array<Observation>;
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


export type QueryCantonObservationsArgs = {
  locale?: Maybe<Scalars['String']>;
  filters?: Maybe<CantonObservationFilters>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  PriceComponents: ResolverTypeWrapper<PriceComponents>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  SearchResult: ResolversTypes['MunicipalityResult'] | ResolversTypes['ProviderResult'] | ResolversTypes['CantonResult'];
  String: ResolverTypeWrapper<Scalars['String']>;
  MunicipalityResult: ResolverTypeWrapper<ResolvedSearchResult>;
  ProviderResult: ResolverTypeWrapper<ResolvedSearchResult>;
  CantonResult: ResolverTypeWrapper<ResolvedSearchResult>;
  Municipality: ResolverTypeWrapper<ResolvedMunicipality>;
  Provider: ResolverTypeWrapper<ResolvedProvider>;
  Canton: ResolverTypeWrapper<ResolvedCanton>;
  TemporalDimension: ResolverTypeWrapper<TemporalDimension>;
  Observation: ResolverTypeWrapper<ResolvedObservation>;
  ObservationFilters: ObservationFilters;
  CantonObservationFilters: CantonObservationFilters;
  PriceComponent: PriceComponent;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  PriceComponents: PriceComponents;
  Float: Scalars['Float'];
  SearchResult: ResolversParentTypes['MunicipalityResult'] | ResolversParentTypes['ProviderResult'] | ResolversParentTypes['CantonResult'];
  String: Scalars['String'];
  MunicipalityResult: ResolvedSearchResult;
  ProviderResult: ResolvedSearchResult;
  CantonResult: ResolvedSearchResult;
  Municipality: ResolvedMunicipality;
  Provider: ResolvedProvider;
  Canton: ResolvedCanton;
  TemporalDimension: TemporalDimension;
  Observation: ResolvedObservation;
  ObservationFilters: ObservationFilters;
  CantonObservationFilters: CantonObservationFilters;
  Query: {};
  Boolean: Scalars['Boolean'];
}>;

export type PriceComponentsResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['PriceComponents'] = ResolversParentTypes['PriceComponents']> = ResolversObject<{
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SearchResultResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['SearchResult'] = ResolversParentTypes['SearchResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'MunicipalityResult' | 'ProviderResult' | 'CantonResult', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MunicipalityResultResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['MunicipalityResult'] = ResolversParentTypes['MunicipalityResult']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ProviderResultResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['ProviderResult'] = ResolversParentTypes['ProviderResult']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type CantonResultResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['CantonResult'] = ResolversParentTypes['CantonResult']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type MunicipalityResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['Municipality'] = ResolversParentTypes['Municipality']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  canton?: Resolver<ResolversTypes['Canton'], ParentType, ContextType>;
  providers?: Resolver<Array<ResolversTypes['Provider']>, ParentType, ContextType>;
  priceComponents?: Resolver<ResolversTypes['PriceComponents'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ProviderResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['Provider'] = ResolversParentTypes['Provider']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType>;
  priceComponents?: Resolver<ResolversTypes['PriceComponents'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type CantonResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['Canton'] = ResolversParentTypes['Canton']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType>;
  priceComponents?: Resolver<ResolversTypes['PriceComponents'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type TemporalDimensionResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['TemporalDimension'] = ResolversParentTypes['TemporalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  min?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  max?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ObservationResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['Observation'] = ResolversParentTypes['Observation']> = ResolversObject<{
  municipality?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  municipalityLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  providerLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canton?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cantonLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  period?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType, RequireFields<ObservationValueArgs, 'priceComponent'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type QueryResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<QueryMunicipalitiesArgs, never>>;
  cantons?: Resolver<Array<ResolversTypes['Canton']>, ParentType, ContextType, RequireFields<QueryCantonsArgs, never>>;
  providers?: Resolver<Array<ResolversTypes['Provider']>, ParentType, ContextType, RequireFields<QueryProvidersArgs, never>>;
  search?: Resolver<Array<ResolversTypes['SearchResult']>, ParentType, ContextType, RequireFields<QuerySearchArgs, never>>;
  municipality?: Resolver<Maybe<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<QueryMunicipalityArgs, 'id'>>;
  canton?: Resolver<Maybe<ResolversTypes['Canton']>, ParentType, ContextType, RequireFields<QueryCantonArgs, 'id'>>;
  provider?: Resolver<Maybe<ResolversTypes['Provider']>, ParentType, ContextType, RequireFields<QueryProviderArgs, 'id'>>;
  observations?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType, RequireFields<QueryObservationsArgs, never>>;
  cantonObservations?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType, RequireFields<QueryCantonObservationsArgs, never>>;
}>;

export type Resolvers<ContextType = ServerContext> = ResolversObject<{
  PriceComponents?: PriceComponentsResolvers<ContextType>;
  SearchResult?: SearchResultResolvers;
  MunicipalityResult?: MunicipalityResultResolvers<ContextType>;
  ProviderResult?: ProviderResultResolvers<ContextType>;
  CantonResult?: CantonResultResolvers<ContextType>;
  Municipality?: MunicipalityResolvers<ContextType>;
  Provider?: ProviderResolvers<ContextType>;
  Canton?: CantonResolvers<ContextType>;
  TemporalDimension?: TemporalDimensionResolvers<ContextType>;
  Observation?: ObservationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ServerContext> = Resolvers<ContextType>;
