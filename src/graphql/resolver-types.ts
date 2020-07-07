import { GraphQLResolveInfo } from 'graphql';
import { ResolvedCanton, ResolvedMunicipality, ResolvedProvider, ResolvedCube } from './shared-types';
export type Maybe<T> = T | null;
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

export type Municipality = {
  __typename?: 'Municipality';
  name: Scalars['String'];
  canton: Canton;
  providers: Array<Provider>;
  priceComponents: PriceComponents;
};

export type Provider = {
  __typename?: 'Provider';
  name: Scalars['String'];
  municipalities: Array<Municipality>;
  priceComponents: PriceComponents;
};

export type Canton = {
  __typename?: 'Canton';
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
  period?: Maybe<Array<Scalars['String']>>;
  municipality?: Maybe<Array<Scalars['String']>>;
  provider?: Maybe<Array<Scalars['String']>>;
  category?: Maybe<Array<Scalars['String']>>;
};

export type Cube = {
  __typename?: 'Cube';
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
};


export type CubeCantonsArgs = {
  query?: Maybe<Scalars['String']>;
};


export type CubeProvidersArgs = {
  query?: Maybe<Scalars['String']>;
};


export type CubeMunicipalityArgs = {
  id: Scalars['String'];
  query?: Maybe<Scalars['String']>;
};


export type CubeCantonArgs = {
  id: Scalars['String'];
  query?: Maybe<Scalars['String']>;
};


export type CubeProviderArgs = {
  id: Scalars['String'];
  query?: Maybe<Scalars['String']>;
};


export type CubeObservationsArgs = {
  filters?: Maybe<ObservationFilters>;
};

export type Query = {
  __typename?: 'Query';
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
  Municipality: ResolverTypeWrapper<ResolvedMunicipality>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Provider: ResolverTypeWrapper<ResolvedProvider>;
  Canton: ResolverTypeWrapper<ResolvedCanton>;
  TemporalDimension: ResolverTypeWrapper<TemporalDimension>;
  Observation: ResolverTypeWrapper<Observation>;
  ObservationFilters: ObservationFilters;
  Cube: ResolverTypeWrapper<ResolvedCube>;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  PriceComponents: PriceComponents;
  Float: Scalars['Float'];
  Municipality: ResolvedMunicipality;
  String: Scalars['String'];
  Provider: ResolvedProvider;
  Canton: ResolvedCanton;
  TemporalDimension: TemporalDimension;
  Observation: Observation;
  ObservationFilters: ObservationFilters;
  Cube: ResolvedCube;
  Query: {};
  Boolean: Scalars['Boolean'];
}>;

export type PriceComponentsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PriceComponents'] = ResolversParentTypes['PriceComponents']> = ResolversObject<{
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type MunicipalityResolvers<ContextType = any, ParentType extends ResolversParentTypes['Municipality'] = ResolversParentTypes['Municipality']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  canton?: Resolver<ResolversTypes['Canton'], ParentType, ContextType>;
  providers?: Resolver<Array<ResolversTypes['Provider']>, ParentType, ContextType>;
  priceComponents?: Resolver<ResolversTypes['PriceComponents'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ProviderResolvers<ContextType = any, ParentType extends ResolversParentTypes['Provider'] = ResolversParentTypes['Provider']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType>;
  priceComponents?: Resolver<ResolversTypes['PriceComponents'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type CantonResolvers<ContextType = any, ParentType extends ResolversParentTypes['Canton'] = ResolversParentTypes['Canton']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType>;
  priceComponents?: Resolver<ResolversTypes['PriceComponents'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type TemporalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['TemporalDimension'] = ResolversParentTypes['TemporalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  min?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  max?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ObservationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Observation'] = ResolversParentTypes['Observation']> = ResolversObject<{
  municipality?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  period?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  aidfee?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  fixcosts?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  charge?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  gridusage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  energy?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  fixcostspercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type CubeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Cube'] = ResolversParentTypes['Cube']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dimensionPeriod?: Resolver<Maybe<ResolversTypes['TemporalDimension']>, ParentType, ContextType>;
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<CubeMunicipalitiesArgs, never>>;
  cantons?: Resolver<Array<ResolversTypes['Canton']>, ParentType, ContextType, RequireFields<CubeCantonsArgs, never>>;
  providers?: Resolver<Array<ResolversTypes['Provider']>, ParentType, ContextType, RequireFields<CubeProvidersArgs, never>>;
  municipality?: Resolver<Maybe<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<CubeMunicipalityArgs, 'id'>>;
  canton?: Resolver<Maybe<ResolversTypes['Canton']>, ParentType, ContextType, RequireFields<CubeCantonArgs, 'id'>>;
  provider?: Resolver<Maybe<ResolversTypes['Provider']>, ParentType, ContextType, RequireFields<CubeProviderArgs, 'id'>>;
  observations?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType, RequireFields<CubeObservationsArgs, never>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  cubes?: Resolver<Array<ResolversTypes['Cube']>, ParentType, ContextType, RequireFields<QueryCubesArgs, never>>;
  cubeByIri?: Resolver<Maybe<ResolversTypes['Cube']>, ParentType, ContextType, RequireFields<QueryCubeByIriArgs, 'iri'>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  PriceComponents?: PriceComponentsResolvers<ContextType>;
  Municipality?: MunicipalityResolvers<ContextType>;
  Provider?: ProviderResolvers<ContextType>;
  Canton?: CantonResolvers<ContextType>;
  TemporalDimension?: TemporalDimensionResolvers<ContextType>;
  Observation?: ObservationResolvers<ContextType>;
  Cube?: CubeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
