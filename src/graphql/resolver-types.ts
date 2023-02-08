import { GraphQLResolveInfo } from "graphql";
import {
  ResolvedCanton,
  ResolvedMunicipality,
  ResolvedOperator,
  ResolvedObservation,
  ResolvedCantonMedianObservation,
  ResolvedSwissMedianObservation,
  ResolvedOperatorObservation,
  ResolvedSearchResult,
} from "./resolver-mapped-types";
import { ServerContext } from "./server-context";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export enum CacheControlScope {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

export type Canton = {
  __typename?: "Canton";
  id: Scalars["String"];
  municipalities: Array<Municipality>;
  name: Scalars["String"];
  operator: Array<Operator>;
};

export type CantonMedianObservation = {
  __typename?: "CantonMedianObservation";
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
  __typename?: "CantonResult";
  id: Scalars["String"];
  name: Scalars["String"];
};

export type CubeHealth = {
  __typename?: "CubeHealth";
  dimensions: Array<Scalars["String"]>;
  ok: Scalars["Boolean"];
};

export type GeverDocumentContent = {
  __typename?: "GeverDocumentContent";
  content: Scalars["String"];
  resp1: Scalars["String"];
  resp2: Scalars["String"];
  resp3: Scalars["String"];
};

export type Municipality = {
  __typename?: "Municipality";
  canton: Canton;
  id: Scalars["String"];
  isAbolished?: Maybe<Scalars["Boolean"]>;
  name: Scalars["String"];
  operators: Array<Operator>;
};

export type MunicipalityResult = SearchResult & {
  __typename?: "MunicipalityResult";
  id: Scalars["String"];
  name: Scalars["String"];
};

export type Observation =
  | CantonMedianObservation
  | OperatorObservation
  | SwissMedianObservation;

export type ObservationFilters = {
  canton?: InputMaybe<Array<Scalars["String"]>>;
  category?: InputMaybe<Array<Scalars["String"]>>;
  municipality?: InputMaybe<Array<Scalars["String"]>>;
  operator?: InputMaybe<Array<Scalars["String"]>>;
  period?: InputMaybe<Array<Scalars["String"]>>;
  product?: InputMaybe<Array<Scalars["String"]>>;
};

export enum ObservationKind {
  Canton = "Canton",
  Municipality = "Municipality",
}

export type Operator = {
  __typename?: "Operator";
  cantons: Array<Canton>;
  documents: Array<OperatorDocument>;
  geverDocuments: Array<OperatorDocument>;
  geverId?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["String"]>;
  municipalities: Array<Municipality>;
  name: Scalars["String"];
};

export type OperatorDocument = {
  __typename?: "OperatorDocument";
  category?: Maybe<OperatorDocumentCategory>;
  id: Scalars["String"];
  name: Scalars["String"];
  url: Scalars["String"];
  year: Scalars["String"];
};

export enum OperatorDocumentCategory {
  AnnualReport = "ANNUAL_REPORT",
  FinancialStatement = "FINANCIAL_STATEMENT",
  Tariffs = "TARIFFS",
}

export type OperatorObservation = {
  __typename?: "OperatorObservation";
  canton: Scalars["String"];
  cantonLabel?: Maybe<Scalars["String"]>;
  category: Scalars["String"];
  municipality: Scalars["String"];
  municipalityLabel?: Maybe<Scalars["String"]>;
  operator: Scalars["String"];
  operatorLabel?: Maybe<Scalars["String"]>;
  period: Scalars["String"];
  value: Scalars["Float"];
};

export type OperatorObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type OperatorResult = SearchResult & {
  __typename?: "OperatorResult";
  id: Scalars["String"];
  name: Scalars["String"];
};

export enum PriceComponent {
  Aidfee = "aidfee",
  Charge = "charge",
  Energy = "energy",
  Fixcosts = "fixcosts",
  Fixcostspercent = "fixcostspercent",
  Gridusage = "gridusage",
  Total = "total",
}

export type Query = {
  __typename?: "Query";
  allMunicipalities: Array<Municipality>;
  canton?: Maybe<Canton>;
  cantonMedianObservations?: Maybe<Array<CantonMedianObservation>>;
  cantons: Array<Canton>;
  cubeHealth?: Maybe<CubeHealth>;
  municipalities: Array<Municipality>;
  municipality?: Maybe<Municipality>;
  observations?: Maybe<Array<OperatorObservation>>;
  operator?: Maybe<Operator>;
  operators: Array<Operator>;
  search: Array<SearchResult>;
  searchCantons: Array<CantonResult>;
  searchMunicipalities: Array<MunicipalityResult>;
  searchOperators: Array<OperatorResult>;
  swissMedianObservations?: Maybe<Array<SwissMedianObservation>>;
  systemInfo: SystemInfo;
  wikiContent?: Maybe<WikiContent>;
};

export type QueryAllMunicipalitiesArgs = {
  locale: Scalars["String"];
};

export type QueryCantonArgs = {
  id: Scalars["String"];
  locale: Scalars["String"];
};

export type QueryCantonMedianObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]>;
  observationKind?: InputMaybe<ObservationKind>;
};

export type QueryCantonsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]>>;
  locale: Scalars["String"];
  query?: InputMaybe<Scalars["String"]>;
};

export type QueryMunicipalitiesArgs = {
  ids?: InputMaybe<Array<Scalars["String"]>>;
  locale: Scalars["String"];
  query?: InputMaybe<Scalars["String"]>;
};

export type QueryMunicipalityArgs = {
  id: Scalars["String"];
  locale: Scalars["String"];
};

export type QueryObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]>;
  observationKind?: InputMaybe<ObservationKind>;
};

export type QueryOperatorArgs = {
  geverId?: InputMaybe<Scalars["String"]>;
  id: Scalars["String"];
  locale: Scalars["String"];
};

export type QueryOperatorsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]>>;
  locale: Scalars["String"];
  query?: InputMaybe<Scalars["String"]>;
};

export type QuerySearchArgs = {
  locale: Scalars["String"];
  query?: InputMaybe<Scalars["String"]>;
};

export type QuerySearchCantonsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]>>;
  locale: Scalars["String"];
  query?: InputMaybe<Scalars["String"]>;
};

export type QuerySearchMunicipalitiesArgs = {
  ids?: InputMaybe<Array<Scalars["String"]>>;
  locale: Scalars["String"];
  query?: InputMaybe<Scalars["String"]>;
};

export type QuerySearchOperatorsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]>>;
  locale: Scalars["String"];
  query?: InputMaybe<Scalars["String"]>;
};

export type QuerySwissMedianObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]>;
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
  __typename?: "SwissMedianObservation";
  category: Scalars["String"];
  period: Scalars["String"];
  value: Scalars["Float"];
};

export type SwissMedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type SystemInfo = {
  __typename?: "SystemInfo";
  SPARQL_ENDPOINT: Scalars["String"];
  VERSION: Scalars["String"];
};

export type WikiContent = {
  __typename?: "WikiContent";
  html: Scalars["String"];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  CacheControlScope: CacheControlScope;
  Canton: ResolverTypeWrapper<ResolvedCanton>;
  CantonMedianObservation: ResolverTypeWrapper<ResolvedCantonMedianObservation>;
  CantonResult: ResolverTypeWrapper<ResolvedSearchResult>;
  CubeHealth: ResolverTypeWrapper<CubeHealth>;
  Float: ResolverTypeWrapper<Scalars["Float"]>;
  GeverDocumentContent: ResolverTypeWrapper<GeverDocumentContent>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  Municipality: ResolverTypeWrapper<ResolvedMunicipality>;
  MunicipalityResult: ResolverTypeWrapper<ResolvedSearchResult>;
  Observation: ResolverTypeWrapper<ResolvedObservation>;
  ObservationFilters: ObservationFilters;
  ObservationKind: ObservationKind;
  Operator: ResolverTypeWrapper<ResolvedOperator>;
  OperatorDocument: ResolverTypeWrapper<OperatorDocument>;
  OperatorDocumentCategory: OperatorDocumentCategory;
  OperatorObservation: ResolverTypeWrapper<ResolvedOperatorObservation>;
  OperatorResult: ResolverTypeWrapper<ResolvedSearchResult>;
  PriceComponent: PriceComponent;
  Query: ResolverTypeWrapper<{}>;
  SearchResult:
    | ResolversTypes["CantonResult"]
    | ResolversTypes["MunicipalityResult"]
    | ResolversTypes["OperatorResult"];
  String: ResolverTypeWrapper<Scalars["String"]>;
  SwissMedianObservation: ResolverTypeWrapper<ResolvedSwissMedianObservation>;
  SystemInfo: ResolverTypeWrapper<SystemInfo>;
  WikiContent: ResolverTypeWrapper<WikiContent>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars["Boolean"];
  Canton: ResolvedCanton;
  CantonMedianObservation: ResolvedCantonMedianObservation;
  CantonResult: ResolvedSearchResult;
  CubeHealth: CubeHealth;
  Float: Scalars["Float"];
  GeverDocumentContent: GeverDocumentContent;
  Int: Scalars["Int"];
  Municipality: ResolvedMunicipality;
  MunicipalityResult: ResolvedSearchResult;
  Observation: ResolvedObservation;
  ObservationFilters: ObservationFilters;
  Operator: ResolvedOperator;
  OperatorDocument: OperatorDocument;
  OperatorObservation: ResolvedOperatorObservation;
  OperatorResult: ResolvedSearchResult;
  Query: {};
  SearchResult:
    | ResolversParentTypes["CantonResult"]
    | ResolversParentTypes["MunicipalityResult"]
    | ResolversParentTypes["OperatorResult"];
  String: Scalars["String"];
  SwissMedianObservation: ResolvedSwissMedianObservation;
  SystemInfo: SystemInfo;
  WikiContent: WikiContent;
}>;

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars["Boolean"]>;
  maxAge?: Maybe<Scalars["Int"]>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<
  Result,
  Parent,
  ContextType = ServerContext,
  Args = CacheControlDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CantonResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["Canton"] = ResolversParentTypes["Canton"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  municipalities?: Resolver<
    Array<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  operator?: Resolver<
    Array<ResolversTypes["Operator"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CantonMedianObservationResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["CantonMedianObservation"] = ResolversParentTypes["CantonMedianObservation"]
> = ResolversObject<{
  canton?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  cantonLabel?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  category?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  period?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  value?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType,
    RequireFields<CantonMedianObservationValueArgs, "priceComponent">
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CantonResultResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["CantonResult"] = ResolversParentTypes["CantonResult"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CubeHealthResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["CubeHealth"] = ResolversParentTypes["CubeHealth"]
> = ResolversObject<{
  dimensions?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  ok?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GeverDocumentContentResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["GeverDocumentContent"] = ResolversParentTypes["GeverDocumentContent"]
> = ResolversObject<{
  content?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  resp1?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  resp2?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  resp3?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MunicipalityResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["Municipality"] = ResolversParentTypes["Municipality"]
> = ResolversObject<{
  canton?: Resolver<ResolversTypes["Canton"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  isAbolished?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  operators?: Resolver<
    Array<ResolversTypes["Operator"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MunicipalityResultResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["MunicipalityResult"] = ResolversParentTypes["MunicipalityResult"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ObservationResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["Observation"] = ResolversParentTypes["Observation"]
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    | "CantonMedianObservation"
    | "OperatorObservation"
    | "SwissMedianObservation",
    ParentType,
    ContextType
  >;
}>;

export type OperatorResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["Operator"] = ResolversParentTypes["Operator"]
> = ResolversObject<{
  cantons?: Resolver<Array<ResolversTypes["Canton"]>, ParentType, ContextType>;
  documents?: Resolver<
    Array<ResolversTypes["OperatorDocument"]>,
    ParentType,
    ContextType
  >;
  geverDocuments?: Resolver<
    Array<ResolversTypes["OperatorDocument"]>,
    ParentType,
    ContextType
  >;
  geverId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  municipalities?: Resolver<
    Array<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorDocumentResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["OperatorDocument"] = ResolversParentTypes["OperatorDocument"]
> = ResolversObject<{
  category?: Resolver<
    Maybe<ResolversTypes["OperatorDocumentCategory"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  year?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorObservationResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["OperatorObservation"] = ResolversParentTypes["OperatorObservation"]
> = ResolversObject<{
  canton?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  cantonLabel?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  category?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  municipality?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  municipalityLabel?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  operator?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  operatorLabel?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  period?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  value?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType,
    RequireFields<OperatorObservationValueArgs, "priceComponent">
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorResultResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["OperatorResult"] = ResolversParentTypes["OperatorResult"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = ResolversObject<{
  allMunicipalities?: Resolver<
    Array<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAllMunicipalitiesArgs, "locale">
  >;
  canton?: Resolver<
    Maybe<ResolversTypes["Canton"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCantonArgs, "id" | "locale">
  >;
  cantonMedianObservations?: Resolver<
    Maybe<Array<ResolversTypes["CantonMedianObservation"]>>,
    ParentType,
    ContextType,
    Partial<QueryCantonMedianObservationsArgs>
  >;
  cantons?: Resolver<
    Array<ResolversTypes["Canton"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCantonsArgs, "locale">
  >;
  cubeHealth?: Resolver<
    Maybe<ResolversTypes["CubeHealth"]>,
    ParentType,
    ContextType
  >;
  municipalities?: Resolver<
    Array<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType,
    RequireFields<QueryMunicipalitiesArgs, "locale">
  >;
  municipality?: Resolver<
    Maybe<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType,
    RequireFields<QueryMunicipalityArgs, "id" | "locale">
  >;
  observations?: Resolver<
    Maybe<Array<ResolversTypes["OperatorObservation"]>>,
    ParentType,
    ContextType,
    Partial<QueryObservationsArgs>
  >;
  operator?: Resolver<
    Maybe<ResolversTypes["Operator"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOperatorArgs, "id" | "locale">
  >;
  operators?: Resolver<
    Array<ResolversTypes["Operator"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOperatorsArgs, "locale">
  >;
  search?: Resolver<
    Array<ResolversTypes["SearchResult"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchArgs, "locale">
  >;
  searchCantons?: Resolver<
    Array<ResolversTypes["CantonResult"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchCantonsArgs, "locale">
  >;
  searchMunicipalities?: Resolver<
    Array<ResolversTypes["MunicipalityResult"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchMunicipalitiesArgs, "locale">
  >;
  searchOperators?: Resolver<
    Array<ResolversTypes["OperatorResult"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchOperatorsArgs, "locale">
  >;
  swissMedianObservations?: Resolver<
    Maybe<Array<ResolversTypes["SwissMedianObservation"]>>,
    ParentType,
    ContextType,
    Partial<QuerySwissMedianObservationsArgs>
  >;
  systemInfo?: Resolver<ResolversTypes["SystemInfo"], ParentType, ContextType>;
  wikiContent?: Resolver<
    Maybe<ResolversTypes["WikiContent"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWikiContentArgs, "locale" | "slug">
  >;
}>;

export type SearchResultResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["SearchResult"] = ResolversParentTypes["SearchResult"]
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    "CantonResult" | "MunicipalityResult" | "OperatorResult",
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
}>;

export type SwissMedianObservationResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["SwissMedianObservation"] = ResolversParentTypes["SwissMedianObservation"]
> = ResolversObject<{
  category?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  period?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  value?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType,
    RequireFields<SwissMedianObservationValueArgs, "priceComponent">
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SystemInfoResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["SystemInfo"] = ResolversParentTypes["SystemInfo"]
> = ResolversObject<{
  SPARQL_ENDPOINT?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  VERSION?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WikiContentResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["WikiContent"] = ResolversParentTypes["WikiContent"]
> = ResolversObject<{
  html?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ServerContext> = ResolversObject<{
  Canton?: CantonResolvers<ContextType>;
  CantonMedianObservation?: CantonMedianObservationResolvers<ContextType>;
  CantonResult?: CantonResultResolvers<ContextType>;
  CubeHealth?: CubeHealthResolvers<ContextType>;
  GeverDocumentContent?: GeverDocumentContentResolvers<ContextType>;
  Municipality?: MunicipalityResolvers<ContextType>;
  MunicipalityResult?: MunicipalityResultResolvers<ContextType>;
  Observation?: ObservationResolvers<ContextType>;
  Operator?: OperatorResolvers<ContextType>;
  OperatorDocument?: OperatorDocumentResolvers<ContextType>;
  OperatorObservation?: OperatorObservationResolvers<ContextType>;
  OperatorResult?: OperatorResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SearchResult?: SearchResultResolvers<ContextType>;
  SwissMedianObservation?: SwissMedianObservationResolvers<ContextType>;
  SystemInfo?: SystemInfoResolvers<ContextType>;
  WikiContent?: WikiContentResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = ServerContext> = ResolversObject<{
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
}>;
