import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
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
import { GraphqlRequestContext } from "./server-context";
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
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  ElectricityCategory: { input: any; output: any };
  WikiContentInfo: { input: any; output: any };
};

export enum CacheControlScope {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

export type Canton = {
  __typename?: "Canton";
  id: Scalars["String"]["output"];
  municipalities: Array<Municipality>;
  name: Scalars["String"]["output"];
  operator: Array<Operator>;
};

export type CantonMedianObservation = {
  __typename?: "CantonMedianObservation";
  canton: Scalars["String"]["output"];
  cantonLabel?: Maybe<Scalars["String"]["output"]>;
  category: Scalars["String"]["output"];
  period: Scalars["String"]["output"];
  value: Scalars["Float"]["output"];
};

export type CantonMedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type CantonResult = SearchResult & {
  __typename?: "CantonResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type CostsAndTariffsData = {
  __typename?: "CostsAndTariffsData";
  energyTariffs: TariffsData;
  latestYear: Scalars["String"]["output"];
  netTariffs: TariffsData;
  networkCosts: NetworkCostsData;
  operator: CostsAndTariffsOperator;
  updateDate: Scalars["String"]["output"];
};

export type CostsAndTariffsFilter = {
  category: Scalars["String"]["input"];
  networkLevel: Scalars["String"]["input"];
  operatorId: Scalars["Int"]["input"];
  period?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CostsAndTariffsOperator = {
  __typename?: "CostsAndTariffsOperator";
  peerGroup: PeerGroup;
};

export type CubeHealth = {
  __typename?: "CubeHealth";
  dimensions: Array<Scalars["String"]["output"]>;
  ok: Scalars["Boolean"]["output"];
};

export type Municipality = {
  __typename?: "Municipality";
  canton: Canton;
  id: Scalars["String"]["output"];
  isAbolished?: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  operators: Array<Operator>;
};

export type MunicipalityResult = SearchResult & {
  __typename?: "MunicipalityResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type NetworkCostRow = {
  __typename?: "NetworkCostRow";
  network_level: Scalars["String"]["output"];
  operator_id: Scalars["Int"]["output"];
  operator_name: Scalars["String"]["output"];
  rate?: Maybe<Scalars["Float"]["output"]>;
  year: Scalars["Int"]["output"];
};

export type NetworkCostsData = {
  __typename?: "NetworkCostsData";
  networkLevel: NetworkLevel;
  operatorRate?: Maybe<Scalars["Float"]["output"]>;
  operatorTrend?: Maybe<Trend>;
  peerGroupMedianRate?: Maybe<Scalars["Float"]["output"]>;
  peerGroupMedianTrend?: Maybe<Trend>;
  yearlyData: Array<NetworkCostRow>;
};

export type NetworkCostsFilter = {
  networkLevel: Scalars["String"]["input"];
  operatorId: Scalars["Int"]["input"];
  operatorOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  period: Scalars["Int"]["input"];
};

export type NetworkLevel = {
  __typename?: "NetworkLevel";
  id: Scalars["String"]["output"];
};

export type Observation =
  | CantonMedianObservation
  | OperatorObservation
  | SwissMedianObservation;

export type ObservationFilters = {
  canton?: InputMaybe<Array<Scalars["String"]["input"]>>;
  category?: InputMaybe<Array<Scalars["String"]["input"]>>;
  municipality?: InputMaybe<Array<Scalars["String"]["input"]>>;
  operator?: InputMaybe<Array<Scalars["String"]["input"]>>;
  period?: InputMaybe<Array<Scalars["String"]["input"]>>;
  product?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export enum ObservationKind {
  Canton = "Canton",
  Municipality = "Municipality",
}

export type OperationalStandardsCompliance = {
  __typename?: "OperationalStandardsCompliance";
  francsRule?: Maybe<Scalars["String"]["output"]>;
  operatorsFrancsPerInvoice: Array<OperationalStandardsOperatorFrancs>;
  timelyPaperSubmission?: Maybe<Scalars["Boolean"]["output"]>;
};

export type OperationalStandardsData = {
  __typename?: "OperationalStandardsData";
  compliance: OperationalStandardsCompliance;
  latestYear: Scalars["String"]["output"];
  operator: OperationalStandardsOperator;
  serviceQuality: OperationalStandardsServiceQuality;
  updateDate: Scalars["String"]["output"];
};

export type OperationalStandardsFilter = {
  operatorId: Scalars["Int"]["input"];
  period: Scalars["Int"]["input"];
};

export type OperationalStandardsOperator = {
  __typename?: "OperationalStandardsOperator";
  peerGroup: PeerGroup;
};

export type OperationalStandardsOperatorFrancs = {
  __typename?: "OperationalStandardsOperatorFrancs";
  francsPerInvoice?: Maybe<Scalars["Float"]["output"]>;
  operatorId: Scalars["String"]["output"];
  year: Scalars["String"]["output"];
};

export type OperationalStandardsOperatorNotification = {
  __typename?: "OperationalStandardsOperatorNotification";
  days?: Maybe<Scalars["Int"]["output"]>;
  operatorId: Scalars["String"]["output"];
  year: Scalars["String"]["output"];
};

export type OperationalStandardsServiceQuality = {
  __typename?: "OperationalStandardsServiceQuality";
  informingCustomersOfOutage?: Maybe<Scalars["Boolean"]["output"]>;
  notificationPeriodDays?: Maybe<Scalars["Int"]["output"]>;
  operatorsNotificationPeriodDays: Array<OperationalStandardsOperatorNotification>;
};

export type Operator = {
  __typename?: "Operator";
  cantons: Array<Canton>;
  documents: Array<OperatorDocument>;
  geverDocuments: Array<OperatorDocument>;
  geverId?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["String"]["output"]>;
  municipalities: Array<Municipality>;
  name: Scalars["String"]["output"];
  peerGroup?: Maybe<PeerGroup>;
};

export type OperatorDocument = {
  __typename?: "OperatorDocument";
  category?: Maybe<OperatorDocumentCategory>;
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
  year: Scalars["String"]["output"];
};

export enum OperatorDocumentCategory {
  AnnualReport = "ANNUAL_REPORT",
  FinancialStatement = "FINANCIAL_STATEMENT",
  Tariffs = "TARIFFS",
}

export type OperatorMunicipality = {
  __typename?: "OperatorMunicipality";
  canton: Scalars["String"]["output"];
  municipality: Scalars["Int"]["output"];
  operator: Scalars["String"]["output"];
};

export type OperatorObservation = {
  __typename?: "OperatorObservation";
  canton: Scalars["String"]["output"];
  cantonLabel?: Maybe<Scalars["String"]["output"]>;
  category: Scalars["String"]["output"];
  coverageRatio: Scalars["Float"]["output"];
  municipality: Scalars["String"]["output"];
  municipalityLabel?: Maybe<Scalars["String"]["output"]>;
  operator: Scalars["String"]["output"];
  operatorLabel?: Maybe<Scalars["String"]["output"]>;
  period: Scalars["String"]["output"];
  value?: Maybe<Scalars["Float"]["output"]>;
};

export type OperatorObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type OperatorResult = SearchResult & {
  __typename?: "OperatorResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type PeerGroup = {
  __typename?: "PeerGroup";
  energyDensity: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  settlementDensity: Scalars["String"]["output"];
};

export type PeerGroupItem = {
  __typename?: "PeerGroupItem";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type PowerStabilityData = {
  __typename?: "PowerStabilityData";
  latestYear: Scalars["String"]["output"];
  operator: PowerStabilityOperator;
  saidi: StabilityData;
  saifi: StabilityData;
  updateDate: Scalars["String"]["output"];
};

export type PowerStabilityFilter = {
  operatorId: Scalars["Int"]["input"];
  period?: InputMaybe<Scalars["Int"]["input"]>;
};

export type PowerStabilityOperator = {
  __typename?: "PowerStabilityOperator";
  peerGroup: PeerGroup;
};

export enum PriceComponent {
  Aidfee = "aidfee",
  Annualmeteringcost = "annualmeteringcost",
  Charge = "charge",
  Energy = "energy",
  Fixcosts = "fixcosts",
  Fixcostspercent = "fixcostspercent",
  Gridusage = "gridusage",
  Meteringrate = "meteringrate",
  Total = "total",
}

export type Query = {
  __typename?: "Query";
  allMunicipalities: Array<Municipality>;
  canton?: Maybe<Canton>;
  cantonMedianObservations?: Maybe<Array<CantonMedianObservation>>;
  cantons: Array<Canton>;
  costsAndTariffs: CostsAndTariffsData;
  cubeHealth?: Maybe<CubeHealth>;
  energyTariffs: TariffsData;
  municipalities: Array<Municipality>;
  municipality?: Maybe<Municipality>;
  netTariffs: TariffsData;
  networkCosts: NetworkCostsData;
  observations?: Maybe<Array<OperatorObservation>>;
  operationalStandards: OperationalStandardsData;
  operator?: Maybe<Operator>;
  operatorMunicipalities: Array<OperatorMunicipality>;
  operators: Array<Operator>;
  peerGroups: Array<PeerGroupItem>;
  powerStability: PowerStabilityData;
  saidi: StabilityData;
  saifi: StabilityData;
  search: Array<SearchResult>;
  searchCantons: Array<CantonResult>;
  searchMunicipalities: Array<MunicipalityResult>;
  searchOperators: Array<OperatorResult>;
  sunshineData: Array<SunshineDataRow>;
  sunshineDataByIndicator: SunshineDataByIndicatorResult;
  sunshineMedianByIndicator?: Maybe<Scalars["Float"]["output"]>;
  sunshineTariffs: Array<SunshineDataRow>;
  sunshineTariffsByIndicator: Array<SunshineDataIndicatorRow>;
  swissMedianObservations?: Maybe<Array<SwissMedianObservation>>;
  systemInfo: SystemInfo;
  wikiContent?: Maybe<WikiContent>;
};

export type QueryAllMunicipalitiesArgs = {
  locale: Scalars["String"]["input"];
};

export type QueryCantonArgs = {
  id: Scalars["String"]["input"];
  locale: Scalars["String"]["input"];
};

export type QueryCantonMedianObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]["input"]>;
  observationKind?: InputMaybe<ObservationKind>;
};

export type QueryCantonsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryCostsAndTariffsArgs = {
  filter: CostsAndTariffsFilter;
};

export type QueryEnergyTariffsArgs = {
  filter: TariffsFilter;
};

export type QueryMunicipalitiesArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryMunicipalityArgs = {
  id: Scalars["String"]["input"];
  locale: Scalars["String"]["input"];
};

export type QueryNetTariffsArgs = {
  filter: TariffsFilter;
};

export type QueryNetworkCostsArgs = {
  filter: NetworkCostsFilter;
};

export type QueryObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]["input"]>;
  observationKind?: InputMaybe<ObservationKind>;
};

export type QueryOperationalStandardsArgs = {
  filter: OperationalStandardsFilter;
};

export type QueryOperatorArgs = {
  geverId?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["String"]["input"];
  locale: Scalars["String"]["input"];
};

export type QueryOperatorMunicipalitiesArgs = {
  electricityCategory?: InputMaybe<Scalars["String"]["input"]>;
  period: Scalars["String"]["input"];
};

export type QueryOperatorsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryPeerGroupsArgs = {
  locale: Scalars["String"]["input"];
};

export type QueryPowerStabilityArgs = {
  filter: PowerStabilityFilter;
};

export type QuerySaidiArgs = {
  filter: StabilityFilter;
};

export type QuerySaifiArgs = {
  filter: StabilityFilter;
};

export type QuerySearchArgs = {
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySearchCantonsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySearchMunicipalitiesArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySearchOperatorsArgs = {
  ids?: InputMaybe<Array<Scalars["String"]["input"]>>;
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySunshineDataArgs = {
  filter: SunshineDataFilter;
};

export type QuerySunshineDataByIndicatorArgs = {
  filter: SunshineDataFilter;
};

export type QuerySunshineMedianByIndicatorArgs = {
  filter: SunshineDataFilter;
};

export type QuerySunshineTariffsArgs = {
  filter: SunshineDataFilter;
};

export type QuerySunshineTariffsByIndicatorArgs = {
  filter: SunshineDataFilter;
  indicator: Scalars["String"]["input"];
};

export type QuerySwissMedianObservationsArgs = {
  filters?: InputMaybe<ObservationFilters>;
  locale?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryWikiContentArgs = {
  locale: Scalars["String"]["input"];
  slug: Scalars["String"]["input"];
};

export type SearchResult = {
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type StabilityData = {
  __typename?: "StabilityData";
  operatorTotal?: Maybe<Scalars["Float"]["output"]>;
  operatorUnplanned?: Maybe<Scalars["Float"]["output"]>;
  peerGroupMedianTotal: Scalars["Float"]["output"];
  peerGroupMedianTrendTotal: Trend;
  peerGroupMedianTrendUnplanned: Trend;
  peerGroupMedianUnplanned: Scalars["Float"]["output"];
  trendTotal?: Maybe<Trend>;
  trendUnplanned?: Maybe<Trend>;
  yearlyData: Array<StabilityDataRow>;
};

export type StabilityDataRow = {
  __typename?: "StabilityDataRow";
  operator_id: Scalars["Int"]["output"];
  operator_name: Scalars["String"]["output"];
  total?: Maybe<Scalars["Float"]["output"]>;
  unplanned?: Maybe<Scalars["Float"]["output"]>;
  year: Scalars["Int"]["output"];
};

export type StabilityFilter = {
  operatorId: Scalars["Int"]["input"];
  operatorOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  year: Scalars["Int"]["input"];
};

export type SunshineDataByIndicatorResult = {
  __typename?: "SunshineDataByIndicatorResult";
  data: Array<SunshineDataIndicatorRow>;
  median?: Maybe<Scalars["Float"]["output"]>;
};

export type SunshineDataFilter = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  indicator?: InputMaybe<Scalars["String"]["input"]>;
  networkLevel?: InputMaybe<Scalars["String"]["input"]>;
  operatorId?: InputMaybe<Scalars["Int"]["input"]>;
  peerGroup?: InputMaybe<Scalars["String"]["input"]>;
  period?: InputMaybe<Scalars["String"]["input"]>;
  saidiSaifiType?: InputMaybe<Scalars["String"]["input"]>;
};

export type SunshineDataIndicatorRow = {
  __typename?: "SunshineDataIndicatorRow";
  name: Scalars["String"]["output"];
  operatorId?: Maybe<Scalars["Int"]["output"]>;
  operatorUID: Scalars["String"]["output"];
  period: Scalars["String"]["output"];
  value?: Maybe<Scalars["Float"]["output"]>;
};

export type SunshineDataRow = {
  __typename?: "SunshineDataRow";
  francRule?: Maybe<Scalars["Float"]["output"]>;
  infoDaysInAdvance?: Maybe<Scalars["Int"]["output"]>;
  infoYesNo?: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  networkCostsNE5?: Maybe<Scalars["Float"]["output"]>;
  networkCostsNE6?: Maybe<Scalars["Float"]["output"]>;
  networkCostsNE7?: Maybe<Scalars["Float"]["output"]>;
  operatorId?: Maybe<Scalars["Int"]["output"]>;
  operatorUID: Scalars["String"]["output"];
  period: Scalars["String"]["output"];
  productsCount?: Maybe<Scalars["Int"]["output"]>;
  productsSelection?: Maybe<Scalars["Boolean"]["output"]>;
  saidiTotal?: Maybe<Scalars["Float"]["output"]>;
  saidiUnplanned?: Maybe<Scalars["Float"]["output"]>;
  saifiTotal?: Maybe<Scalars["Float"]["output"]>;
  saifiUnplanned?: Maybe<Scalars["Float"]["output"]>;
  tariffEC2?: Maybe<Scalars["Float"]["output"]>;
  tariffEC3?: Maybe<Scalars["Float"]["output"]>;
  tariffEC4?: Maybe<Scalars["Float"]["output"]>;
  tariffEC6?: Maybe<Scalars["Float"]["output"]>;
  tariffEH2?: Maybe<Scalars["Float"]["output"]>;
  tariffEH4?: Maybe<Scalars["Float"]["output"]>;
  tariffEH7?: Maybe<Scalars["Float"]["output"]>;
  tariffNC2?: Maybe<Scalars["Float"]["output"]>;
  tariffNC3?: Maybe<Scalars["Float"]["output"]>;
  tariffNC4?: Maybe<Scalars["Float"]["output"]>;
  tariffNC6?: Maybe<Scalars["Float"]["output"]>;
  tariffNH2?: Maybe<Scalars["Float"]["output"]>;
  tariffNH4?: Maybe<Scalars["Float"]["output"]>;
  tariffNH7?: Maybe<Scalars["Float"]["output"]>;
  timely?: Maybe<Scalars["Boolean"]["output"]>;
};

export type SwissMedianObservation = {
  __typename?: "SwissMedianObservation";
  category: Scalars["String"]["output"];
  period: Scalars["String"]["output"];
  value: Scalars["Float"]["output"];
};

export type SwissMedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type SystemInfo = {
  __typename?: "SystemInfo";
  SPARQL_ENDPOINT: Scalars["String"]["output"];
  VERSION: Scalars["String"]["output"];
};

export type TariffRow = {
  __typename?: "TariffRow";
  category: Scalars["ElectricityCategory"]["output"];
  operator_id: Scalars["Int"]["output"];
  operator_name: Scalars["String"]["output"];
  period: Scalars["Int"]["output"];
  rate?: Maybe<Scalars["Float"]["output"]>;
};

export type TariffsData = {
  __typename?: "TariffsData";
  category: Scalars["ElectricityCategory"]["output"];
  operatorRate?: Maybe<Scalars["Float"]["output"]>;
  operatorTrend?: Maybe<Trend>;
  peerGroupMedianRate?: Maybe<Scalars["Float"]["output"]>;
  peerGroupMedianTrend?: Maybe<Trend>;
  yearlyData: Array<TariffRow>;
};

export type TariffsFilter = {
  category: Scalars["String"]["input"];
  operatorId: Scalars["Int"]["input"];
  operatorOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  period: Scalars["Int"]["input"];
};

export enum Trend {
  Down = "down",
  Stable = "stable",
  Up = "up",
}

export type WikiContent = {
  __typename?: "WikiContent";
  html: Scalars["String"]["output"];
  info?: Maybe<Scalars["WikiContentInfo"]["output"]>;
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

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> =
  ResolversObject<{
    SearchResult:
      | ResolvedSearchResult
      | ResolvedSearchResult
      | ResolvedSearchResult;
  }>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  CacheControlScope: CacheControlScope;
  Canton: ResolverTypeWrapper<ResolvedCanton>;
  CantonMedianObservation: ResolverTypeWrapper<ResolvedCantonMedianObservation>;
  CantonResult: ResolverTypeWrapper<ResolvedSearchResult>;
  CostsAndTariffsData: ResolverTypeWrapper<CostsAndTariffsData>;
  CostsAndTariffsFilter: CostsAndTariffsFilter;
  CostsAndTariffsOperator: ResolverTypeWrapper<CostsAndTariffsOperator>;
  CubeHealth: ResolverTypeWrapper<CubeHealth>;
  ElectricityCategory: ResolverTypeWrapper<
    Scalars["ElectricityCategory"]["output"]
  >;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  Municipality: ResolverTypeWrapper<ResolvedMunicipality>;
  MunicipalityResult: ResolverTypeWrapper<ResolvedSearchResult>;
  NetworkCostRow: ResolverTypeWrapper<NetworkCostRow>;
  NetworkCostsData: ResolverTypeWrapper<NetworkCostsData>;
  NetworkCostsFilter: NetworkCostsFilter;
  NetworkLevel: ResolverTypeWrapper<NetworkLevel>;
  Observation: ResolverTypeWrapper<ResolvedObservation>;
  ObservationFilters: ObservationFilters;
  ObservationKind: ObservationKind;
  OperationalStandardsCompliance: ResolverTypeWrapper<OperationalStandardsCompliance>;
  OperationalStandardsData: ResolverTypeWrapper<OperationalStandardsData>;
  OperationalStandardsFilter: OperationalStandardsFilter;
  OperationalStandardsOperator: ResolverTypeWrapper<OperationalStandardsOperator>;
  OperationalStandardsOperatorFrancs: ResolverTypeWrapper<OperationalStandardsOperatorFrancs>;
  OperationalStandardsOperatorNotification: ResolverTypeWrapper<OperationalStandardsOperatorNotification>;
  OperationalStandardsServiceQuality: ResolverTypeWrapper<OperationalStandardsServiceQuality>;
  Operator: ResolverTypeWrapper<ResolvedOperator>;
  OperatorDocument: ResolverTypeWrapper<OperatorDocument>;
  OperatorDocumentCategory: OperatorDocumentCategory;
  OperatorMunicipality: ResolverTypeWrapper<OperatorMunicipality>;
  OperatorObservation: ResolverTypeWrapper<ResolvedOperatorObservation>;
  OperatorResult: ResolverTypeWrapper<ResolvedSearchResult>;
  PeerGroup: ResolverTypeWrapper<PeerGroup>;
  PeerGroupItem: ResolverTypeWrapper<PeerGroupItem>;
  PowerStabilityData: ResolverTypeWrapper<PowerStabilityData>;
  PowerStabilityFilter: PowerStabilityFilter;
  PowerStabilityOperator: ResolverTypeWrapper<PowerStabilityOperator>;
  PriceComponent: PriceComponent;
  Query: ResolverTypeWrapper<{}>;
  SearchResult: ResolverTypeWrapper<
    ResolversInterfaceTypes<ResolversTypes>["SearchResult"]
  >;
  StabilityData: ResolverTypeWrapper<StabilityData>;
  StabilityDataRow: ResolverTypeWrapper<StabilityDataRow>;
  StabilityFilter: StabilityFilter;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  SunshineDataByIndicatorResult: ResolverTypeWrapper<SunshineDataByIndicatorResult>;
  SunshineDataFilter: SunshineDataFilter;
  SunshineDataIndicatorRow: ResolverTypeWrapper<SunshineDataIndicatorRow>;
  SunshineDataRow: ResolverTypeWrapper<SunshineDataRow>;
  SwissMedianObservation: ResolverTypeWrapper<ResolvedSwissMedianObservation>;
  SystemInfo: ResolverTypeWrapper<SystemInfo>;
  TariffRow: ResolverTypeWrapper<TariffRow>;
  TariffsData: ResolverTypeWrapper<TariffsData>;
  TariffsFilter: TariffsFilter;
  Trend: Trend;
  WikiContent: ResolverTypeWrapper<WikiContent>;
  WikiContentInfo: ResolverTypeWrapper<Scalars["WikiContentInfo"]["output"]>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars["Boolean"]["output"];
  Canton: ResolvedCanton;
  CantonMedianObservation: ResolvedCantonMedianObservation;
  CantonResult: ResolvedSearchResult;
  CostsAndTariffsData: CostsAndTariffsData;
  CostsAndTariffsFilter: CostsAndTariffsFilter;
  CostsAndTariffsOperator: CostsAndTariffsOperator;
  CubeHealth: CubeHealth;
  ElectricityCategory: Scalars["ElectricityCategory"]["output"];
  Float: Scalars["Float"]["output"];
  Int: Scalars["Int"]["output"];
  Municipality: ResolvedMunicipality;
  MunicipalityResult: ResolvedSearchResult;
  NetworkCostRow: NetworkCostRow;
  NetworkCostsData: NetworkCostsData;
  NetworkCostsFilter: NetworkCostsFilter;
  NetworkLevel: NetworkLevel;
  Observation: ResolvedObservation;
  ObservationFilters: ObservationFilters;
  OperationalStandardsCompliance: OperationalStandardsCompliance;
  OperationalStandardsData: OperationalStandardsData;
  OperationalStandardsFilter: OperationalStandardsFilter;
  OperationalStandardsOperator: OperationalStandardsOperator;
  OperationalStandardsOperatorFrancs: OperationalStandardsOperatorFrancs;
  OperationalStandardsOperatorNotification: OperationalStandardsOperatorNotification;
  OperationalStandardsServiceQuality: OperationalStandardsServiceQuality;
  Operator: ResolvedOperator;
  OperatorDocument: OperatorDocument;
  OperatorMunicipality: OperatorMunicipality;
  OperatorObservation: ResolvedOperatorObservation;
  OperatorResult: ResolvedSearchResult;
  PeerGroup: PeerGroup;
  PeerGroupItem: PeerGroupItem;
  PowerStabilityData: PowerStabilityData;
  PowerStabilityFilter: PowerStabilityFilter;
  PowerStabilityOperator: PowerStabilityOperator;
  Query: {};
  SearchResult: ResolversInterfaceTypes<ResolversParentTypes>["SearchResult"];
  StabilityData: StabilityData;
  StabilityDataRow: StabilityDataRow;
  StabilityFilter: StabilityFilter;
  String: Scalars["String"]["output"];
  SunshineDataByIndicatorResult: SunshineDataByIndicatorResult;
  SunshineDataFilter: SunshineDataFilter;
  SunshineDataIndicatorRow: SunshineDataIndicatorRow;
  SunshineDataRow: SunshineDataRow;
  SwissMedianObservation: ResolvedSwissMedianObservation;
  SystemInfo: SystemInfo;
  TariffRow: TariffRow;
  TariffsData: TariffsData;
  TariffsFilter: TariffsFilter;
  WikiContent: WikiContent;
  WikiContentInfo: Scalars["WikiContentInfo"]["output"];
}>;

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars["Boolean"]["input"]>;
  maxAge?: Maybe<Scalars["Int"]["input"]>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<
  Result,
  Parent,
  ContextType = GraphqlRequestContext,
  Args = CacheControlDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CantonResolvers<
  ContextType = GraphqlRequestContext,
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
  ContextType = GraphqlRequestContext,
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
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["CantonResult"] = ResolversParentTypes["CantonResult"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CostsAndTariffsDataResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["CostsAndTariffsData"] = ResolversParentTypes["CostsAndTariffsData"]
> = ResolversObject<{
  energyTariffs?: Resolver<
    ResolversTypes["TariffsData"],
    ParentType,
    ContextType
  >;
  latestYear?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  netTariffs?: Resolver<ResolversTypes["TariffsData"], ParentType, ContextType>;
  networkCosts?: Resolver<
    ResolversTypes["NetworkCostsData"],
    ParentType,
    ContextType
  >;
  operator?: Resolver<
    ResolversTypes["CostsAndTariffsOperator"],
    ParentType,
    ContextType
  >;
  updateDate?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CostsAndTariffsOperatorResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["CostsAndTariffsOperator"] = ResolversParentTypes["CostsAndTariffsOperator"]
> = ResolversObject<{
  peerGroup?: Resolver<ResolversTypes["PeerGroup"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CubeHealthResolvers<
  ContextType = GraphqlRequestContext,
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

export interface ElectricityCategoryScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["ElectricityCategory"], any> {
  name: "ElectricityCategory";
}

export type MunicipalityResolvers<
  ContextType = GraphqlRequestContext,
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
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["MunicipalityResult"] = ResolversParentTypes["MunicipalityResult"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NetworkCostRowResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["NetworkCostRow"] = ResolversParentTypes["NetworkCostRow"]
> = ResolversObject<{
  network_level?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  operator_id?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  operator_name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  rate?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  year?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NetworkCostsDataResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["NetworkCostsData"] = ResolversParentTypes["NetworkCostsData"]
> = ResolversObject<{
  networkLevel?: Resolver<
    ResolversTypes["NetworkLevel"],
    ParentType,
    ContextType
  >;
  operatorRate?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  operatorTrend?: Resolver<
    Maybe<ResolversTypes["Trend"]>,
    ParentType,
    ContextType
  >;
  peerGroupMedianRate?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  peerGroupMedianTrend?: Resolver<
    Maybe<ResolversTypes["Trend"]>,
    ParentType,
    ContextType
  >;
  yearlyData?: Resolver<
    Array<ResolversTypes["NetworkCostRow"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NetworkLevelResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["NetworkLevel"] = ResolversParentTypes["NetworkLevel"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ObservationResolvers<
  ContextType = GraphqlRequestContext,
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

export type OperationalStandardsComplianceResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperationalStandardsCompliance"] = ResolversParentTypes["OperationalStandardsCompliance"]
> = ResolversObject<{
  francsRule?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  operatorsFrancsPerInvoice?: Resolver<
    Array<ResolversTypes["OperationalStandardsOperatorFrancs"]>,
    ParentType,
    ContextType
  >;
  timelyPaperSubmission?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperationalStandardsDataResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperationalStandardsData"] = ResolversParentTypes["OperationalStandardsData"]
> = ResolversObject<{
  compliance?: Resolver<
    ResolversTypes["OperationalStandardsCompliance"],
    ParentType,
    ContextType
  >;
  latestYear?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  operator?: Resolver<
    ResolversTypes["OperationalStandardsOperator"],
    ParentType,
    ContextType
  >;
  serviceQuality?: Resolver<
    ResolversTypes["OperationalStandardsServiceQuality"],
    ParentType,
    ContextType
  >;
  updateDate?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperationalStandardsOperatorResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperationalStandardsOperator"] = ResolversParentTypes["OperationalStandardsOperator"]
> = ResolversObject<{
  peerGroup?: Resolver<ResolversTypes["PeerGroup"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperationalStandardsOperatorFrancsResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperationalStandardsOperatorFrancs"] = ResolversParentTypes["OperationalStandardsOperatorFrancs"]
> = ResolversObject<{
  francsPerInvoice?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  operatorId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  year?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperationalStandardsOperatorNotificationResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperationalStandardsOperatorNotification"] = ResolversParentTypes["OperationalStandardsOperatorNotification"]
> = ResolversObject<{
  days?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  operatorId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  year?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperationalStandardsServiceQualityResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperationalStandardsServiceQuality"] = ResolversParentTypes["OperationalStandardsServiceQuality"]
> = ResolversObject<{
  informingCustomersOfOutage?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  notificationPeriodDays?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  operatorsNotificationPeriodDays?: Resolver<
    Array<ResolversTypes["OperationalStandardsOperatorNotification"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorResolvers<
  ContextType = GraphqlRequestContext,
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
  peerGroup?: Resolver<
    Maybe<ResolversTypes["PeerGroup"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorDocumentResolvers<
  ContextType = GraphqlRequestContext,
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

export type OperatorMunicipalityResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperatorMunicipality"] = ResolversParentTypes["OperatorMunicipality"]
> = ResolversObject<{
  canton?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  municipality?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  operator?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorObservationResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperatorObservation"] = ResolversParentTypes["OperatorObservation"]
> = ResolversObject<{
  canton?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  cantonLabel?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  category?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  coverageRatio?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
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
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType,
    RequireFields<OperatorObservationValueArgs, "priceComponent">
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OperatorResultResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["OperatorResult"] = ResolversParentTypes["OperatorResult"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PeerGroupResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["PeerGroup"] = ResolversParentTypes["PeerGroup"]
> = ResolversObject<{
  energyDensity?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  settlementDensity?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PeerGroupItemResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["PeerGroupItem"] = ResolversParentTypes["PeerGroupItem"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PowerStabilityDataResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["PowerStabilityData"] = ResolversParentTypes["PowerStabilityData"]
> = ResolversObject<{
  latestYear?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  operator?: Resolver<
    ResolversTypes["PowerStabilityOperator"],
    ParentType,
    ContextType
  >;
  saidi?: Resolver<ResolversTypes["StabilityData"], ParentType, ContextType>;
  saifi?: Resolver<ResolversTypes["StabilityData"], ParentType, ContextType>;
  updateDate?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PowerStabilityOperatorResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["PowerStabilityOperator"] = ResolversParentTypes["PowerStabilityOperator"]
> = ResolversObject<{
  peerGroup?: Resolver<ResolversTypes["PeerGroup"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = GraphqlRequestContext,
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
  costsAndTariffs?: Resolver<
    ResolversTypes["CostsAndTariffsData"],
    ParentType,
    ContextType,
    RequireFields<QueryCostsAndTariffsArgs, "filter">
  >;
  cubeHealth?: Resolver<
    Maybe<ResolversTypes["CubeHealth"]>,
    ParentType,
    ContextType
  >;
  energyTariffs?: Resolver<
    ResolversTypes["TariffsData"],
    ParentType,
    ContextType,
    RequireFields<QueryEnergyTariffsArgs, "filter">
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
  netTariffs?: Resolver<
    ResolversTypes["TariffsData"],
    ParentType,
    ContextType,
    RequireFields<QueryNetTariffsArgs, "filter">
  >;
  networkCosts?: Resolver<
    ResolversTypes["NetworkCostsData"],
    ParentType,
    ContextType,
    RequireFields<QueryNetworkCostsArgs, "filter">
  >;
  observations?: Resolver<
    Maybe<Array<ResolversTypes["OperatorObservation"]>>,
    ParentType,
    ContextType,
    Partial<QueryObservationsArgs>
  >;
  operationalStandards?: Resolver<
    ResolversTypes["OperationalStandardsData"],
    ParentType,
    ContextType,
    RequireFields<QueryOperationalStandardsArgs, "filter">
  >;
  operator?: Resolver<
    Maybe<ResolversTypes["Operator"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOperatorArgs, "id" | "locale">
  >;
  operatorMunicipalities?: Resolver<
    Array<ResolversTypes["OperatorMunicipality"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOperatorMunicipalitiesArgs, "period">
  >;
  operators?: Resolver<
    Array<ResolversTypes["Operator"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOperatorsArgs, "locale">
  >;
  peerGroups?: Resolver<
    Array<ResolversTypes["PeerGroupItem"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPeerGroupsArgs, "locale">
  >;
  powerStability?: Resolver<
    ResolversTypes["PowerStabilityData"],
    ParentType,
    ContextType,
    RequireFields<QueryPowerStabilityArgs, "filter">
  >;
  saidi?: Resolver<
    ResolversTypes["StabilityData"],
    ParentType,
    ContextType,
    RequireFields<QuerySaidiArgs, "filter">
  >;
  saifi?: Resolver<
    ResolversTypes["StabilityData"],
    ParentType,
    ContextType,
    RequireFields<QuerySaifiArgs, "filter">
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
  sunshineData?: Resolver<
    Array<ResolversTypes["SunshineDataRow"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySunshineDataArgs, "filter">
  >;
  sunshineDataByIndicator?: Resolver<
    ResolversTypes["SunshineDataByIndicatorResult"],
    ParentType,
    ContextType,
    RequireFields<QuerySunshineDataByIndicatorArgs, "filter">
  >;
  sunshineMedianByIndicator?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySunshineMedianByIndicatorArgs, "filter">
  >;
  sunshineTariffs?: Resolver<
    Array<ResolversTypes["SunshineDataRow"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySunshineTariffsArgs, "filter">
  >;
  sunshineTariffsByIndicator?: Resolver<
    Array<ResolversTypes["SunshineDataIndicatorRow"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySunshineTariffsByIndicatorArgs, "filter" | "indicator">
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
  ContextType = GraphqlRequestContext,
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

export type StabilityDataResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["StabilityData"] = ResolversParentTypes["StabilityData"]
> = ResolversObject<{
  operatorTotal?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  operatorUnplanned?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  peerGroupMedianTotal?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType
  >;
  peerGroupMedianTrendTotal?: Resolver<
    ResolversTypes["Trend"],
    ParentType,
    ContextType
  >;
  peerGroupMedianTrendUnplanned?: Resolver<
    ResolversTypes["Trend"],
    ParentType,
    ContextType
  >;
  peerGroupMedianUnplanned?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType
  >;
  trendTotal?: Resolver<
    Maybe<ResolversTypes["Trend"]>,
    ParentType,
    ContextType
  >;
  trendUnplanned?: Resolver<
    Maybe<ResolversTypes["Trend"]>,
    ParentType,
    ContextType
  >;
  yearlyData?: Resolver<
    Array<ResolversTypes["StabilityDataRow"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StabilityDataRowResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["StabilityDataRow"] = ResolversParentTypes["StabilityDataRow"]
> = ResolversObject<{
  operator_id?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  operator_name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  unplanned?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  year?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SunshineDataByIndicatorResultResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["SunshineDataByIndicatorResult"] = ResolversParentTypes["SunshineDataByIndicatorResult"]
> = ResolversObject<{
  data?: Resolver<
    Array<ResolversTypes["SunshineDataIndicatorRow"]>,
    ParentType,
    ContextType
  >;
  median?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SunshineDataIndicatorRowResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["SunshineDataIndicatorRow"] = ResolversParentTypes["SunshineDataIndicatorRow"]
> = ResolversObject<{
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  operatorId?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  operatorUID?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  period?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SunshineDataRowResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["SunshineDataRow"] = ResolversParentTypes["SunshineDataRow"]
> = ResolversObject<{
  francRule?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  infoDaysInAdvance?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  infoYesNo?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  networkCostsNE5?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  networkCostsNE6?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  networkCostsNE7?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  operatorId?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  operatorUID?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  period?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  productsCount?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  productsSelection?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  saidiTotal?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  saidiUnplanned?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  saifiTotal?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  saifiUnplanned?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  tariffEC2?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffEC3?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffEC4?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffEC6?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffEH2?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffEH4?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffEH7?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffNC2?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffNC3?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffNC4?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffNC6?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffNH2?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffNH4?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  tariffNH7?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  timely?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SwissMedianObservationResolvers<
  ContextType = GraphqlRequestContext,
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
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["SystemInfo"] = ResolversParentTypes["SystemInfo"]
> = ResolversObject<{
  SPARQL_ENDPOINT?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  VERSION?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TariffRowResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["TariffRow"] = ResolversParentTypes["TariffRow"]
> = ResolversObject<{
  category?: Resolver<
    ResolversTypes["ElectricityCategory"],
    ParentType,
    ContextType
  >;
  operator_id?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  operator_name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  period?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  rate?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TariffsDataResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["TariffsData"] = ResolversParentTypes["TariffsData"]
> = ResolversObject<{
  category?: Resolver<
    ResolversTypes["ElectricityCategory"],
    ParentType,
    ContextType
  >;
  operatorRate?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  operatorTrend?: Resolver<
    Maybe<ResolversTypes["Trend"]>,
    ParentType,
    ContextType
  >;
  peerGroupMedianRate?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  peerGroupMedianTrend?: Resolver<
    Maybe<ResolversTypes["Trend"]>,
    ParentType,
    ContextType
  >;
  yearlyData?: Resolver<
    Array<ResolversTypes["TariffRow"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WikiContentResolvers<
  ContextType = GraphqlRequestContext,
  ParentType extends ResolversParentTypes["WikiContent"] = ResolversParentTypes["WikiContent"]
> = ResolversObject<{
  html?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  info?: Resolver<
    Maybe<ResolversTypes["WikiContentInfo"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface WikiContentInfoScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["WikiContentInfo"], any> {
  name: "WikiContentInfo";
}

export type Resolvers<ContextType = GraphqlRequestContext> = ResolversObject<{
  Canton?: CantonResolvers<ContextType>;
  CantonMedianObservation?: CantonMedianObservationResolvers<ContextType>;
  CantonResult?: CantonResultResolvers<ContextType>;
  CostsAndTariffsData?: CostsAndTariffsDataResolvers<ContextType>;
  CostsAndTariffsOperator?: CostsAndTariffsOperatorResolvers<ContextType>;
  CubeHealth?: CubeHealthResolvers<ContextType>;
  ElectricityCategory?: GraphQLScalarType;
  Municipality?: MunicipalityResolvers<ContextType>;
  MunicipalityResult?: MunicipalityResultResolvers<ContextType>;
  NetworkCostRow?: NetworkCostRowResolvers<ContextType>;
  NetworkCostsData?: NetworkCostsDataResolvers<ContextType>;
  NetworkLevel?: NetworkLevelResolvers<ContextType>;
  Observation?: ObservationResolvers<ContextType>;
  OperationalStandardsCompliance?: OperationalStandardsComplianceResolvers<ContextType>;
  OperationalStandardsData?: OperationalStandardsDataResolvers<ContextType>;
  OperationalStandardsOperator?: OperationalStandardsOperatorResolvers<ContextType>;
  OperationalStandardsOperatorFrancs?: OperationalStandardsOperatorFrancsResolvers<ContextType>;
  OperationalStandardsOperatorNotification?: OperationalStandardsOperatorNotificationResolvers<ContextType>;
  OperationalStandardsServiceQuality?: OperationalStandardsServiceQualityResolvers<ContextType>;
  Operator?: OperatorResolvers<ContextType>;
  OperatorDocument?: OperatorDocumentResolvers<ContextType>;
  OperatorMunicipality?: OperatorMunicipalityResolvers<ContextType>;
  OperatorObservation?: OperatorObservationResolvers<ContextType>;
  OperatorResult?: OperatorResultResolvers<ContextType>;
  PeerGroup?: PeerGroupResolvers<ContextType>;
  PeerGroupItem?: PeerGroupItemResolvers<ContextType>;
  PowerStabilityData?: PowerStabilityDataResolvers<ContextType>;
  PowerStabilityOperator?: PowerStabilityOperatorResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SearchResult?: SearchResultResolvers<ContextType>;
  StabilityData?: StabilityDataResolvers<ContextType>;
  StabilityDataRow?: StabilityDataRowResolvers<ContextType>;
  SunshineDataByIndicatorResult?: SunshineDataByIndicatorResultResolvers<ContextType>;
  SunshineDataIndicatorRow?: SunshineDataIndicatorRowResolvers<ContextType>;
  SunshineDataRow?: SunshineDataRowResolvers<ContextType>;
  SwissMedianObservation?: SwissMedianObservationResolvers<ContextType>;
  SystemInfo?: SystemInfoResolvers<ContextType>;
  TariffRow?: TariffRowResolvers<ContextType>;
  TariffsData?: TariffsDataResolvers<ContextType>;
  WikiContent?: WikiContentResolvers<ContextType>;
  WikiContentInfo?: GraphQLScalarType;
}>;

export type DirectiveResolvers<ContextType = GraphqlRequestContext> =
  ResolversObject<{
    cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
  }>;
