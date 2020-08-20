import { GraphQLResolveInfo } from 'graphql';
import { ResolvedCanton, ResolvedMunicipality, ResolvedOperator, ResolvedObservation, ResolvedMedianObservation, ResolvedOperatorObservation, ResolvedSearchResult } from './resolver-mapped-types';
import { ServerContext } from './server-context';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
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

export type OperatorResult = SearchResult & {
  __typename?: 'OperatorResult';
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
  operators: Array<Operator>;
  priceComponents: PriceComponents;
};

export type Operator = {
  __typename?: 'Operator';
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

export type OperatorObservation = {
  __typename?: 'OperatorObservation';
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
  __typename?: 'MedianObservation';
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
  __typename?: 'Query';
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
  SearchResult: ResolversTypes['MunicipalityResult'] | ResolversTypes['OperatorResult'] | ResolversTypes['CantonResult'];
  String: ResolverTypeWrapper<Scalars['String']>;
  MunicipalityResult: ResolverTypeWrapper<ResolvedSearchResult>;
  OperatorResult: ResolverTypeWrapper<ResolvedSearchResult>;
  CantonResult: ResolverTypeWrapper<ResolvedSearchResult>;
  Municipality: ResolverTypeWrapper<ResolvedMunicipality>;
  Operator: ResolverTypeWrapper<ResolvedOperator>;
  Canton: ResolverTypeWrapper<ResolvedCanton>;
  TemporalDimension: ResolverTypeWrapper<TemporalDimension>;
  OperatorObservation: ResolverTypeWrapper<ResolvedOperatorObservation>;
  MedianObservation: ResolverTypeWrapper<ResolvedMedianObservation>;
  Observation: ResolverTypeWrapper<ResolvedObservation>;
  ObservationFilters: ObservationFilters;
  PriceComponent: PriceComponent;
  ObservationType: ObservationType;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  PriceComponents: PriceComponents;
  Float: Scalars['Float'];
  SearchResult: ResolversParentTypes['MunicipalityResult'] | ResolversParentTypes['OperatorResult'] | ResolversParentTypes['CantonResult'];
  String: Scalars['String'];
  MunicipalityResult: ResolvedSearchResult;
  OperatorResult: ResolvedSearchResult;
  CantonResult: ResolvedSearchResult;
  Municipality: ResolvedMunicipality;
  Operator: ResolvedOperator;
  Canton: ResolvedCanton;
  TemporalDimension: TemporalDimension;
  OperatorObservation: ResolvedOperatorObservation;
  MedianObservation: ResolvedMedianObservation;
  Observation: ResolvedObservation;
  ObservationFilters: ObservationFilters;
  Query: {};
  Boolean: Scalars['Boolean'];
}>;

export type PriceComponentsResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['PriceComponents'] = ResolversParentTypes['PriceComponents']> = ResolversObject<{
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SearchResultResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['SearchResult'] = ResolversParentTypes['SearchResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'MunicipalityResult' | 'OperatorResult' | 'CantonResult', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MunicipalityResultResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['MunicipalityResult'] = ResolversParentTypes['MunicipalityResult']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type OperatorResultResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['OperatorResult'] = ResolversParentTypes['OperatorResult']> = ResolversObject<{
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
  operators?: Resolver<Array<ResolversTypes['Operator']>, ParentType, ContextType>;
  priceComponents?: Resolver<ResolversTypes['PriceComponents'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type OperatorResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['Operator'] = ResolversParentTypes['Operator']> = ResolversObject<{
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

export type OperatorObservationResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['OperatorObservation'] = ResolversParentTypes['OperatorObservation']> = ResolversObject<{
  municipality?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  municipalityLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operator?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  operatorLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canton?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cantonLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  period?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType, RequireFields<OperatorObservationValueArgs, 'priceComponent'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type MedianObservationResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['MedianObservation'] = ResolversParentTypes['MedianObservation']> = ResolversObject<{
  canton?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cantonLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  period?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType, RequireFields<MedianObservationValueArgs, 'priceComponent'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ObservationResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['Observation'] = ResolversParentTypes['Observation']> = ResolversObject<{
  __resolveType: TypeResolveFn<'OperatorObservation' | 'MedianObservation', ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ServerContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<QueryMunicipalitiesArgs, never>>;
  cantons?: Resolver<Array<ResolversTypes['Canton']>, ParentType, ContextType, RequireFields<QueryCantonsArgs, never>>;
  operators?: Resolver<Array<ResolversTypes['Operator']>, ParentType, ContextType, RequireFields<QueryOperatorsArgs, never>>;
  search?: Resolver<Array<ResolversTypes['SearchResult']>, ParentType, ContextType, RequireFields<QuerySearchArgs, never>>;
  municipality?: Resolver<Maybe<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<QueryMunicipalityArgs, 'id'>>;
  canton?: Resolver<Maybe<ResolversTypes['Canton']>, ParentType, ContextType, RequireFields<QueryCantonArgs, 'id'>>;
  operator?: Resolver<Maybe<ResolversTypes['Operator']>, ParentType, ContextType, RequireFields<QueryOperatorArgs, 'id'>>;
  observations?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType, RequireFields<QueryObservationsArgs, never>>;
}>;

export type Resolvers<ContextType = ServerContext> = ResolversObject<{
  PriceComponents?: PriceComponentsResolvers<ContextType>;
  SearchResult?: SearchResultResolvers<ContextType>;
  MunicipalityResult?: MunicipalityResultResolvers<ContextType>;
  OperatorResult?: OperatorResultResolvers<ContextType>;
  CantonResult?: CantonResultResolvers<ContextType>;
  Municipality?: MunicipalityResolvers<ContextType>;
  Operator?: OperatorResolvers<ContextType>;
  Canton?: CantonResolvers<ContextType>;
  TemporalDimension?: TemporalDimensionResolvers<ContextType>;
  OperatorObservation?: OperatorObservationResolvers<ContextType>;
  MedianObservation?: MedianObservationResolvers<ContextType>;
  Observation?: ObservationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ServerContext> = Resolvers<ContextType>;
