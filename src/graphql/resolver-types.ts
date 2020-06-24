import { GraphQLResolveInfo } from 'graphql';
import { ResolvedCanton, ResolvedMunicipality, ResolvedProvider } from './shared-types';
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

export type Query = {
  __typename?: 'Query';
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  providers: Array<Provider>;
  municipality?: Maybe<Municipality>;
  canton?: Maybe<Canton>;
  provider?: Maybe<Provider>;
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

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  municipalities?: Resolver<Array<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<QueryMunicipalitiesArgs, never>>;
  cantons?: Resolver<Array<ResolversTypes['Canton']>, ParentType, ContextType, RequireFields<QueryCantonsArgs, never>>;
  providers?: Resolver<Array<ResolversTypes['Provider']>, ParentType, ContextType, RequireFields<QueryProvidersArgs, never>>;
  municipality?: Resolver<Maybe<ResolversTypes['Municipality']>, ParentType, ContextType, RequireFields<QueryMunicipalityArgs, 'id'>>;
  canton?: Resolver<Maybe<ResolversTypes['Canton']>, ParentType, ContextType, RequireFields<QueryCantonArgs, 'id'>>;
  provider?: Resolver<Maybe<ResolversTypes['Provider']>, ParentType, ContextType, RequireFields<QueryProviderArgs, 'id'>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  PriceComponents?: PriceComponentsResolvers<ContextType>;
  Municipality?: MunicipalityResolvers<ContextType>;
  Provider?: ProviderResolvers<ContextType>;
  Canton?: CantonResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
