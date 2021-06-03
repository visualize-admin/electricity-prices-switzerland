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
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Canton = {
  __typename?: "Canton";
  id: Scalars["String"];
  name: Scalars["String"];
  municipalities: Array<Municipality>;
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

export type Municipality = {
  __typename?: "Municipality";
  id: Scalars["String"];
  name: Scalars["String"];
  canton: Canton;
  operators: Array<Operator>;
};

export type MunicipalityResult = SearchResult & {
  __typename?: "MunicipalityResult";
  id: Scalars["String"];
  name: Scalars["String"];
};

export type Observation =
  | OperatorObservation
  | CantonMedianObservation
  | SwissMedianObservation;

export type ObservationFilters = {
  period?: Maybe<Array<Scalars["String"]>>;
  municipality?: Maybe<Array<Scalars["String"]>>;
  canton?: Maybe<Array<Scalars["String"]>>;
  operator?: Maybe<Array<Scalars["String"]>>;
  category?: Maybe<Array<Scalars["String"]>>;
  product?: Maybe<Array<Scalars["String"]>>;
};

export enum ObservationKind {
  Canton = "Canton",
  Municipality = "Municipality",
}

export type Operator = {
  __typename?: "Operator";
  id: Scalars["String"];
  name: Scalars["String"];
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  documents: Array<OperatorDocument>;
};

export type OperatorDocument = {
  __typename?: "OperatorDocument";
  id: Scalars["String"];
  name: Scalars["String"];
  url: Scalars["String"];
  year: Scalars["String"];
  category?: Maybe<OperatorDocumentCategory>;
};

export enum OperatorDocumentCategory {
  Tariffs = "TARIFFS",
  FinancialStatement = "FINANCIAL_STATEMENT",
  AnnualReport = "ANNUAL_REPORT",
}

export type OperatorObservation = {
  __typename?: "OperatorObservation";
  municipality: Scalars["String"];
  municipalityLabel?: Maybe<Scalars["String"]>;
  operator: Scalars["String"];
  operatorLabel?: Maybe<Scalars["String"]>;
  canton: Scalars["String"];
  cantonLabel?: Maybe<Scalars["String"]>;
  category: Scalars["String"];
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
  Fixcosts = "fixcosts",
  Charge = "charge",
  Gridusage = "gridusage",
  Energy = "energy",
  Fixcostspercent = "fixcostspercent",
  Total = "total",
}

export type Query = {
  __typename?: "Query";
  systemInfo: SystemInfo;
  municipalities: Array<Municipality>;
  cantons: Array<Canton>;
  operators: Array<Operator>;
  search: Array<SearchResult>;
  searchMunicipalities: Array<MunicipalityResult>;
  searchCantons: Array<CantonResult>;
  searchOperators: Array<OperatorResult>;
  municipality?: Maybe<Municipality>;
  canton?: Maybe<Canton>;
  operator?: Maybe<Operator>;
  observations?: Maybe<Array<OperatorObservation>>;
  cantonMedianObservations?: Maybe<Array<CantonMedianObservation>>;
  swissMedianObservations?: Maybe<Array<SwissMedianObservation>>;
  wikiContent?: Maybe<WikiContent>;
};

export type QueryMunicipalitiesArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QueryCantonsArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QueryOperatorsArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QuerySearchArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
};

export type QuerySearchMunicipalitiesArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QuerySearchCantonsArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QuerySearchOperatorsArgs = {
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  ids?: Maybe<Array<Scalars["String"]>>;
};

export type QueryMunicipalityArgs = {
  locale: Scalars["String"];
  id: Scalars["String"];
};

export type QueryCantonArgs = {
  locale: Scalars["String"];
  id: Scalars["String"];
};

export type QueryOperatorArgs = {
  locale: Scalars["String"];
  id: Scalars["String"];
};

export type QueryObservationsArgs = {
  locale?: Maybe<Scalars["String"]>;
  filters?: Maybe<ObservationFilters>;
  observationKind?: Maybe<ObservationKind>;
};

export type QueryCantonMedianObservationsArgs = {
  locale?: Maybe<Scalars["String"]>;
  filters?: Maybe<ObservationFilters>;
  observationKind?: Maybe<ObservationKind>;
};

export type QuerySwissMedianObservationsArgs = {
  locale?: Maybe<Scalars["String"]>;
  filters?: Maybe<ObservationFilters>;
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

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  ResolverFn<TResult, TParent, TContext, TArgs>;

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
  Canton: ResolverTypeWrapper<ResolvedCanton>;
  String: ResolverTypeWrapper<Scalars["String"]>;
  CantonMedianObservation: ResolverTypeWrapper<ResolvedCantonMedianObservation>;
  Float: ResolverTypeWrapper<Scalars["Float"]>;
  CantonResult: ResolverTypeWrapper<ResolvedSearchResult>;
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
  SwissMedianObservation: ResolverTypeWrapper<ResolvedSwissMedianObservation>;
  SystemInfo: ResolverTypeWrapper<SystemInfo>;
  WikiContent: ResolverTypeWrapper<WikiContent>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Canton: ResolvedCanton;
  String: Scalars["String"];
  CantonMedianObservation: ResolvedCantonMedianObservation;
  Float: Scalars["Float"];
  CantonResult: ResolvedSearchResult;
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
  SwissMedianObservation: ResolvedSwissMedianObservation;
  SystemInfo: SystemInfo;
  WikiContent: WikiContent;
  Boolean: Scalars["Boolean"];
}>;

export type CantonResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["Canton"] = ResolversParentTypes["Canton"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  municipalities?: Resolver<
    Array<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType
  >;
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

export type MunicipalityResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["Municipality"] = ResolversParentTypes["Municipality"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  canton?: Resolver<ResolversTypes["Canton"], ParentType, ContextType>;
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
    | "OperatorObservation"
    | "CantonMedianObservation"
    | "SwissMedianObservation",
    ParentType,
    ContextType
  >;
}>;

export type OperatorResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["Operator"] = ResolversParentTypes["Operator"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  municipalities?: Resolver<
    Array<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType
  >;
  cantons?: Resolver<Array<ResolversTypes["Canton"]>, ParentType, ContextType>;
  documents?: Resolver<
    Array<ResolversTypes["OperatorDocument"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorDocumentResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["OperatorDocument"] = ResolversParentTypes["OperatorDocument"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  year?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  category?: Resolver<
    Maybe<ResolversTypes["OperatorDocumentCategory"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorObservationResolvers<
  ContextType = ServerContext,
  ParentType extends ResolversParentTypes["OperatorObservation"] = ResolversParentTypes["OperatorObservation"]
> = ResolversObject<{
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
  systemInfo?: Resolver<ResolversTypes["SystemInfo"], ParentType, ContextType>;
  municipalities?: Resolver<
    Array<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType,
    RequireFields<QueryMunicipalitiesArgs, "locale">
  >;
  cantons?: Resolver<
    Array<ResolversTypes["Canton"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCantonsArgs, "locale">
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
  searchMunicipalities?: Resolver<
    Array<ResolversTypes["MunicipalityResult"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchMunicipalitiesArgs, "locale">
  >;
  searchCantons?: Resolver<
    Array<ResolversTypes["CantonResult"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchCantonsArgs, "locale">
  >;
  searchOperators?: Resolver<
    Array<ResolversTypes["OperatorResult"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchOperatorsArgs, "locale">
  >;
  municipality?: Resolver<
    Maybe<ResolversTypes["Municipality"]>,
    ParentType,
    ContextType,
    RequireFields<QueryMunicipalityArgs, "locale" | "id">
  >;
  canton?: Resolver<
    Maybe<ResolversTypes["Canton"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCantonArgs, "locale" | "id">
  >;
  operator?: Resolver<
    Maybe<ResolversTypes["Operator"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOperatorArgs, "locale" | "id">
  >;
  observations?: Resolver<
    Maybe<Array<ResolversTypes["OperatorObservation"]>>,
    ParentType,
    ContextType,
    RequireFields<QueryObservationsArgs, never>
  >;
  cantonMedianObservations?: Resolver<
    Maybe<Array<ResolversTypes["CantonMedianObservation"]>>,
    ParentType,
    ContextType,
    RequireFields<QueryCantonMedianObservationsArgs, never>
  >;
  swissMedianObservations?: Resolver<
    Maybe<Array<ResolversTypes["SwissMedianObservation"]>>,
    ParentType,
    ContextType,
    RequireFields<QuerySwissMedianObservationsArgs, never>
  >;
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

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ServerContext> = Resolvers<ContextType>;
