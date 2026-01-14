import gql from "graphql-tag";
import * as Urql from "urql";
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
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
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
  __typename: "Canton";
  id: Scalars["String"]["output"];
  municipalities: Array<Municipality>;
  name: Scalars["String"]["output"];
  operator: Array<Operator>;
};

export type CantonMedianObservation = {
  __typename: "CantonMedianObservation";
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
  __typename: "CantonResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type CostsAndTariffsData = {
  __typename: "CostsAndTariffsData";
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
  __typename: "CostsAndTariffsOperator";
  peerGroup: PeerGroup;
};

export type CubeHealth = {
  __typename: "CubeHealth";
  dimensions: Array<Scalars["String"]["output"]>;
  ok: Scalars["Boolean"]["output"];
};

export type Municipality = {
  __typename: "Municipality";
  canton: Canton;
  id: Scalars["String"]["output"];
  isAbolished?: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  operators: Array<Operator>;
};

export type MunicipalityResult = SearchResult & {
  __typename: "MunicipalityResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type NetworkCostRow = {
  __typename: "NetworkCostRow";
  network_level: Scalars["String"]["output"];
  operator_id: Scalars["Int"]["output"];
  operator_name: Scalars["String"]["output"];
  rate?: Maybe<Scalars["Float"]["output"]>;
  year: Scalars["Int"]["output"];
};

export type NetworkCostsData = {
  __typename: "NetworkCostsData";
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
  __typename: "NetworkLevel";
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
  __typename: "OperationalStandardsCompliance";
  francsRule?: Maybe<Scalars["String"]["output"]>;
  operatorsFrancsPerInvoice: Array<OperationalStandardsOperatorFrancs>;
  timelyPaperSubmission?: Maybe<Scalars["Boolean"]["output"]>;
};

export type OperationalStandardsData = {
  __typename: "OperationalStandardsData";
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
  __typename: "OperationalStandardsOperator";
  peerGroup: PeerGroup;
};

export type OperationalStandardsOperatorFrancs = {
  __typename: "OperationalStandardsOperatorFrancs";
  francsPerInvoice?: Maybe<Scalars["Float"]["output"]>;
  operatorId: Scalars["String"]["output"];
  year: Scalars["String"]["output"];
};

export type OperationalStandardsOperatorNotification = {
  __typename: "OperationalStandardsOperatorNotification";
  days?: Maybe<Scalars["Int"]["output"]>;
  operatorId: Scalars["String"]["output"];
  year: Scalars["String"]["output"];
};

export type OperationalStandardsServiceQuality = {
  __typename: "OperationalStandardsServiceQuality";
  informingCustomersOfOutage?: Maybe<Scalars["Boolean"]["output"]>;
  notificationPeriodDays?: Maybe<Scalars["Int"]["output"]>;
  operatorsNotificationPeriodDays: Array<OperationalStandardsOperatorNotification>;
};

export type Operator = {
  __typename: "Operator";
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
  __typename: "OperatorDocument";
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
  __typename: "OperatorMunicipality";
  canton: Scalars["String"]["output"];
  municipality: Scalars["Int"]["output"];
  operator: Scalars["String"]["output"];
};

export type OperatorObservation = {
  __typename: "OperatorObservation";
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
  __typename: "OperatorResult";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type PeerGroup = {
  __typename: "PeerGroup";
  energyDensity: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  settlementDensity: Scalars["String"]["output"];
};

export type PeerGroupItem = {
  __typename: "PeerGroupItem";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type PowerStabilityData = {
  __typename: "PowerStabilityData";
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
  __typename: "PowerStabilityOperator";
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
  __typename: "Query";
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
  __typename: "StabilityData";
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
  __typename: "StabilityDataRow";
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
  __typename: "SunshineDataByIndicatorResult";
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
  __typename: "SunshineDataIndicatorRow";
  name: Scalars["String"]["output"];
  operatorId?: Maybe<Scalars["Int"]["output"]>;
  operatorUID: Scalars["String"]["output"];
  period: Scalars["String"]["output"];
  value?: Maybe<Scalars["Float"]["output"]>;
};

export type SunshineDataRow = {
  __typename: "SunshineDataRow";
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
  __typename: "SwissMedianObservation";
  category: Scalars["String"]["output"];
  period: Scalars["String"]["output"];
  value: Scalars["Float"]["output"];
};

export type SwissMedianObservationValueArgs = {
  priceComponent: PriceComponent;
};

export type SystemInfo = {
  __typename: "SystemInfo";
  SPARQL_ENDPOINT: Scalars["String"]["output"];
  VERSION: Scalars["String"]["output"];
};

export type TariffRow = {
  __typename: "TariffRow";
  category: Scalars["ElectricityCategory"]["output"];
  operator_id: Scalars["Int"]["output"];
  operator_name: Scalars["String"]["output"];
  period: Scalars["Int"]["output"];
  rate?: Maybe<Scalars["Float"]["output"]>;
};

export type TariffsData = {
  __typename: "TariffsData";
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
  __typename: "WikiContent";
  html: Scalars["String"]["output"];
  info?: Maybe<Scalars["WikiContentInfo"]["output"]>;
};

export type MunicipalitiesQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
  ids?: InputMaybe<
    Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
  >;
}>;

export type MunicipalitiesQuery = {
  __typename: "Query";
  municipalities: Array<{
    __typename: "MunicipalityResult";
    id: string;
    name: string;
  }>;
};

export type AllMunicipalitiesQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
}>;

export type AllMunicipalitiesQuery = {
  __typename: "Query";
  municipalities: Array<{
    __typename: "Municipality";
    id: string;
    name: string;
  }>;
};

export type OperatorsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
  ids?: InputMaybe<
    Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
  >;
}>;

export type OperatorsQuery = {
  __typename: "Query";
  operators: Array<{ __typename: "OperatorResult"; id: string; name: string }>;
};

export type CantonsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
  ids?: InputMaybe<
    Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
  >;
}>;

export type CantonsQuery = {
  __typename: "Query";
  cantons: Array<{ __typename: "CantonResult"; id: string; name: string }>;
};

export type PeerGroupsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
}>;

export type PeerGroupsQuery = {
  __typename: "Query";
  peerGroups: Array<{ __typename: "PeerGroupItem"; id: string; name: string }>;
};

export type SearchQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SearchQuery = {
  __typename: "Query";
  search: Array<
    | { __typename: "CantonResult"; id: string; name: string }
    | { __typename: "MunicipalityResult"; id: string; name: string }
    | { __typename: "OperatorResult"; id: string; name: string }
  >;
};

export type OperatorObservationFieldsFragment = {
  __typename: "OperatorObservation";
  period: string;
  municipality: string;
  municipalityLabel?: string | null;
  operator: string;
  operatorLabel?: string | null;
  canton: string;
  cantonLabel?: string | null;
  category: string;
  value?: number | null;
  coverageRatio: number;
};

export type CantonMedianObservationFieldsFragment = {
  __typename: "CantonMedianObservation";
  period: string;
  canton: string;
  cantonLabel?: string | null;
  category: string;
  value: number;
};

export type SwissMedianObservationFieldsFragment = {
  __typename: "SwissMedianObservation";
  period: string;
  category: string;
  value: number;
};

export type ObservationsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  priceComponent: PriceComponent;
  filters: ObservationFilters;
  observationKind?: InputMaybe<ObservationKind>;
}>;

export type ObservationsQuery = {
  __typename: "Query";
  observations?: Array<{
    __typename: "OperatorObservation";
    period: string;
    municipality: string;
    municipalityLabel?: string | null;
    operator: string;
    operatorLabel?: string | null;
    canton: string;
    cantonLabel?: string | null;
    category: string;
    value?: number | null;
    coverageRatio: number;
  }> | null;
  cantonMedianObservations?: Array<{
    __typename: "CantonMedianObservation";
    period: string;
    canton: string;
    cantonLabel?: string | null;
    category: string;
    value: number;
  }> | null;
  swissMedianObservations?: Array<{
    __typename: "SwissMedianObservation";
    period: string;
    category: string;
    value: number;
  }> | null;
};

export type OperatorObservationWithAllPriceComponentsFieldsFragment = {
  __typename: "OperatorObservation";
  period: string;
  municipality: string;
  municipalityLabel?: string | null;
  operator: string;
  operatorLabel?: string | null;
  category: string;
  aidfee?: number | null;
  annualmeteringcost?: number | null;
  meteringrate?: number | null;
  fixcosts?: number | null;
  charge?: number | null;
  gridusage?: number | null;
  energy?: number | null;
  fixcostspercent?: number | null;
  total?: number | null;
};

export type CantonMedianObservationWithAllPriceComponentsFieldsFragment = {
  __typename: "CantonMedianObservation";
  period: string;
  canton: string;
  cantonLabel?: string | null;
  category: string;
  aidfee: number;
  charge: number;
  gridusage: number;
  energy: number;
  total: number;
};

export type ObservationsWithAllPriceComponentsQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  filters: ObservationFilters;
  observationKind?: InputMaybe<ObservationKind>;
}>;

export type ObservationsWithAllPriceComponentsQuery = {
  __typename: "Query";
  observations?: Array<{
    __typename: "OperatorObservation";
    period: string;
    municipality: string;
    municipalityLabel?: string | null;
    operator: string;
    operatorLabel?: string | null;
    category: string;
    aidfee?: number | null;
    annualmeteringcost?: number | null;
    meteringrate?: number | null;
    fixcosts?: number | null;
    charge?: number | null;
    gridusage?: number | null;
    energy?: number | null;
    fixcostspercent?: number | null;
    total?: number | null;
  }> | null;
  cantonMedianObservations?: Array<{
    __typename: "CantonMedianObservation";
    period: string;
    canton: string;
    cantonLabel?: string | null;
    category: string;
    aidfee: number;
    charge: number;
    gridusage: number;
    energy: number;
    total: number;
  }> | null;
};

export type OperatorDocumentsQueryVariables = Exact<{
  id: Scalars["String"]["input"];
  locale: Scalars["String"]["input"];
}>;

export type OperatorDocumentsQuery = {
  __typename: "Query";
  operator?: {
    __typename: "Operator";
    name: string;
    documents: Array<{
      __typename: "OperatorDocument";
      id: string;
      name: string;
      url: string;
      year: string;
      category?: OperatorDocumentCategory | null;
    }>;
    geverDocuments: Array<{
      __typename: "OperatorDocument";
      id: string;
      name: string;
      url: string;
      year: string;
      category?: OperatorDocumentCategory | null;
    }>;
  } | null;
};

export type WikiContentQueryVariables = Exact<{
  locale: Scalars["String"]["input"];
  slug: Scalars["String"]["input"];
}>;

export type WikiContentQuery = {
  __typename: "Query";
  wikiContent?: {
    __typename: "WikiContent";
    html: string;
    info?: any | null;
  } | null;
};

export type OperatorMunicipalitiesQueryVariables = Exact<{
  period: Scalars["String"]["input"];
  electricityCategory?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type OperatorMunicipalitiesQuery = {
  __typename: "Query";
  operatorMunicipalities: Array<{
    __typename: "OperatorMunicipality";
    municipality: number;
    canton: string;
    operator: string;
  }>;
};

export type SystemInfoQueryVariables = Exact<{ [key: string]: never }>;

export type SystemInfoQuery = {
  __typename: "Query";
  systemInfo: {
    __typename: "SystemInfo";
    SPARQL_ENDPOINT: string;
    VERSION: string;
  };
};

export type CubeHealthQueryVariables = Exact<{ [key: string]: never }>;

export type CubeHealthQuery = {
  __typename: "Query";
  cubeHealth?: {
    __typename: "CubeHealth";
    ok: boolean;
    dimensions: Array<string>;
  } | null;
};

export type SunshineDataQueryVariables = Exact<{
  filter: SunshineDataFilter;
}>;

export type SunshineDataQuery = {
  __typename: "Query";
  sunshineData: Array<{
    __typename: "SunshineDataRow";
    operatorId?: number | null;
    operatorUID: string;
    name: string;
    period: string;
    francRule?: number | null;
    infoYesNo?: boolean | null;
    infoDaysInAdvance?: number | null;
    productsCount?: number | null;
    productsSelection?: boolean | null;
    timely?: boolean | null;
    saidiTotal?: number | null;
    saidiUnplanned?: number | null;
    saifiTotal?: number | null;
    saifiUnplanned?: number | null;
    networkCostsNE5?: number | null;
    networkCostsNE6?: number | null;
    networkCostsNE7?: number | null;
    tariffEC2?: number | null;
    tariffEC3?: number | null;
    tariffEC4?: number | null;
    tariffEC6?: number | null;
    tariffEH2?: number | null;
    tariffEH4?: number | null;
    tariffEH7?: number | null;
    tariffNC2?: number | null;
    tariffNC3?: number | null;
    tariffNC4?: number | null;
    tariffNC6?: number | null;
    tariffNH2?: number | null;
    tariffNH4?: number | null;
    tariffNH7?: number | null;
  }>;
};

export type SunshineDataByIndicatorQueryVariables = Exact<{
  filter: SunshineDataFilter;
}>;

export type SunshineDataByIndicatorQuery = {
  __typename: "Query";
  sunshineMedianByIndicator?: number | null;
  sunshineDataByIndicator: {
    __typename: "SunshineDataByIndicatorResult";
    data: Array<{
      __typename: "SunshineDataIndicatorRow";
      operatorId?: number | null;
      operatorUID: string;
      name: string;
      period: string;
      value?: number | null;
    }>;
  };
};

export type SunshineTariffQueryVariables = Exact<{
  filter: SunshineDataFilter;
}>;

export type SunshineTariffQuery = {
  __typename: "Query";
  sunshineTariffs: Array<{
    __typename: "SunshineDataRow";
    operatorId?: number | null;
    operatorUID: string;
    name: string;
    period: string;
    francRule?: number | null;
    infoYesNo?: boolean | null;
    infoDaysInAdvance?: number | null;
    productsCount?: number | null;
    productsSelection?: boolean | null;
    timely?: boolean | null;
    saidiTotal?: number | null;
    saidiUnplanned?: number | null;
    saifiTotal?: number | null;
    saifiUnplanned?: number | null;
    tariffEC2?: number | null;
    tariffEC3?: number | null;
    tariffEC4?: number | null;
    tariffEC6?: number | null;
    tariffEH2?: number | null;
    tariffEH4?: number | null;
    tariffEH7?: number | null;
    tariffNC2?: number | null;
    tariffNC3?: number | null;
    tariffNC4?: number | null;
    tariffNC6?: number | null;
    tariffNH2?: number | null;
    tariffNH4?: number | null;
    tariffNH7?: number | null;
  }>;
};

export type SunshineTariffByIndicatorQueryVariables = Exact<{
  filter: SunshineDataFilter;
  indicator: Scalars["String"]["input"];
}>;

export type SunshineTariffByIndicatorQuery = {
  __typename: "Query";
  sunshineTariffsByIndicator: Array<{
    __typename: "SunshineDataIndicatorRow";
    operatorId?: number | null;
    operatorUID: string;
    name: string;
    period: string;
    value?: number | null;
  }>;
};

export type OperationalStandardsQueryVariables = Exact<{
  filter: OperationalStandardsFilter;
}>;

export type OperationalStandardsQuery = {
  __typename: "Query";
  operationalStandards: {
    __typename: "OperationalStandardsData";
    latestYear: string;
    updateDate: string;
    operator: {
      __typename: "OperationalStandardsOperator";
      peerGroup: {
        __typename: "PeerGroup";
        settlementDensity: string;
        energyDensity: string;
      };
    };
    serviceQuality: {
      __typename: "OperationalStandardsServiceQuality";
      notificationPeriodDays?: number | null;
      informingCustomersOfOutage?: boolean | null;
      operatorsNotificationPeriodDays: Array<{
        __typename: "OperationalStandardsOperatorNotification";
        operatorId: string;
        days?: number | null;
        year: string;
      }>;
    };
    compliance: {
      __typename: "OperationalStandardsCompliance";
      francsRule?: string | null;
      timelyPaperSubmission?: boolean | null;
      operatorsFrancsPerInvoice: Array<{
        __typename: "OperationalStandardsOperatorFrancs";
        operatorId: string;
        francsPerInvoice?: number | null;
        year: string;
      }>;
    };
  };
};

export type SaidiQueryVariables = Exact<{
  filter: StabilityFilter;
}>;

export type SaidiQuery = {
  __typename: "Query";
  saidi: {
    __typename: "StabilityData";
    operatorTotal?: number | null;
    operatorUnplanned?: number | null;
    trendTotal?: Trend | null;
    trendUnplanned?: Trend | null;
    peerGroupMedianTotal: number;
    peerGroupMedianUnplanned: number;
    peerGroupMedianTrendTotal: Trend;
    peerGroupMedianTrendUnplanned: Trend;
    yearlyData: Array<{
      __typename: "StabilityDataRow";
      year: number;
      total?: number | null;
      unplanned?: number | null;
      operator_id: number;
      operator_name: string;
    }>;
  };
};

export type SaifiQueryVariables = Exact<{
  filter: StabilityFilter;
}>;

export type SaifiQuery = {
  __typename: "Query";
  saifi: {
    __typename: "StabilityData";
    operatorTotal?: number | null;
    operatorUnplanned?: number | null;
    trendTotal?: Trend | null;
    trendUnplanned?: Trend | null;
    peerGroupMedianTotal: number;
    peerGroupMedianUnplanned: number;
    peerGroupMedianTrendTotal: Trend;
    peerGroupMedianTrendUnplanned: Trend;
    yearlyData: Array<{
      __typename: "StabilityDataRow";
      year: number;
      total?: number | null;
      unplanned?: number | null;
      operator_id: number;
      operator_name: string;
    }>;
  };
};

export type CostsAndTariffsQueryVariables = Exact<{
  filter: CostsAndTariffsFilter;
}>;

export type CostsAndTariffsQuery = {
  __typename: "Query";
  costsAndTariffs: {
    __typename: "CostsAndTariffsData";
    latestYear: string;
    updateDate: string;
    operator: {
      __typename: "CostsAndTariffsOperator";
      peerGroup: {
        __typename: "PeerGroup";
        id: string;
        settlementDensity: string;
        energyDensity: string;
      };
    };
    networkCosts: {
      __typename: "NetworkCostsData";
      operatorRate?: number | null;
      operatorTrend?: Trend | null;
      peerGroupMedianRate?: number | null;
      peerGroupMedianTrend?: Trend | null;
      networkLevel: { __typename: "NetworkLevel"; id: string };
      yearlyData: Array<{
        __typename: "NetworkCostRow";
        year: number;
        rate?: number | null;
        operator_id: number;
        operator_name: string;
        network_level: string;
      }>;
    };
    netTariffs: {
      __typename: "TariffsData";
      category: any;
      operatorRate?: number | null;
      operatorTrend?: Trend | null;
      peerGroupMedianRate?: number | null;
      peerGroupMedianTrend?: Trend | null;
      yearlyData: Array<{
        __typename: "TariffRow";
        period: number;
        rate?: number | null;
        operator_id: number;
        operator_name: string;
        category: any;
      }>;
    };
    energyTariffs: {
      __typename: "TariffsData";
      category: any;
      operatorRate?: number | null;
      operatorTrend?: Trend | null;
      peerGroupMedianRate?: number | null;
      peerGroupMedianTrend?: Trend | null;
      yearlyData: Array<{
        __typename: "TariffRow";
        period: number;
        rate?: number | null;
        operator_id: number;
        operator_name: string;
        category: any;
      }>;
    };
  };
};

export type PowerStabilityQueryVariables = Exact<{
  filter: PowerStabilityFilter;
}>;

export type PowerStabilityQuery = {
  __typename: "Query";
  powerStability: {
    __typename: "PowerStabilityData";
    latestYear: string;
    updateDate: string;
    operator: {
      __typename: "PowerStabilityOperator";
      peerGroup: {
        __typename: "PeerGroup";
        id: string;
        settlementDensity: string;
        energyDensity: string;
      };
    };
    saidi: {
      __typename: "StabilityData";
      operatorTotal?: number | null;
      operatorUnplanned?: number | null;
      trendTotal?: Trend | null;
      trendUnplanned?: Trend | null;
      peerGroupMedianTotal: number;
      peerGroupMedianUnplanned: number;
      peerGroupMedianTrendTotal: Trend;
      peerGroupMedianTrendUnplanned: Trend;
      yearlyData: Array<{
        __typename: "StabilityDataRow";
        year: number;
        total?: number | null;
        unplanned?: number | null;
        operator_id: number;
        operator_name: string;
      }>;
    };
    saifi: {
      __typename: "StabilityData";
      operatorTotal?: number | null;
      operatorUnplanned?: number | null;
      trendTotal?: Trend | null;
      trendUnplanned?: Trend | null;
      peerGroupMedianTotal: number;
      peerGroupMedianUnplanned: number;
      peerGroupMedianTrendTotal: Trend;
      peerGroupMedianTrendUnplanned: Trend;
      yearlyData: Array<{
        __typename: "StabilityDataRow";
        year: number;
        total?: number | null;
        unplanned?: number | null;
        operator_id: number;
        operator_name: string;
      }>;
    };
  };
};

export type NetworkCostsQueryVariables = Exact<{
  filter: NetworkCostsFilter;
}>;

export type NetworkCostsQuery = {
  __typename: "Query";
  networkCosts: {
    __typename: "NetworkCostsData";
    operatorRate?: number | null;
    operatorTrend?: Trend | null;
    peerGroupMedianRate?: number | null;
    peerGroupMedianTrend?: Trend | null;
    networkLevel: { __typename: "NetworkLevel"; id: string };
    yearlyData: Array<{
      __typename: "NetworkCostRow";
      year: number;
      rate?: number | null;
      operator_id: number;
      operator_name: string;
      network_level: string;
    }>;
  };
};

export type EnergyTariffsQueryVariables = Exact<{
  filter: TariffsFilter;
}>;

export type EnergyTariffsQuery = {
  __typename: "Query";
  energyTariffs: {
    __typename: "TariffsData";
    category: any;
    operatorRate?: number | null;
    operatorTrend?: Trend | null;
    peerGroupMedianRate?: number | null;
    peerGroupMedianTrend?: Trend | null;
    yearlyData: Array<{
      __typename: "TariffRow";
      period: number;
      rate?: number | null;
      operator_id: number;
      operator_name: string;
      category: any;
    }>;
  };
};

export type NetTariffsQueryVariables = Exact<{
  filter: TariffsFilter;
}>;

export type NetTariffsQuery = {
  __typename: "Query";
  netTariffs: {
    __typename: "TariffsData";
    category: any;
    operatorRate?: number | null;
    operatorTrend?: Trend | null;
    peerGroupMedianRate?: number | null;
    peerGroupMedianTrend?: Trend | null;
    yearlyData: Array<{
      __typename: "TariffRow";
      period: number;
      rate?: number | null;
      operator_id: number;
      operator_name: string;
      category: any;
    }>;
  };
};

export const OperatorObservationFieldsFragmentDoc = gql`
  fragment operatorObservationFields on OperatorObservation {
    period
    municipality
    municipalityLabel
    operator
    operatorLabel
    canton
    cantonLabel
    category
    value(priceComponent: $priceComponent)
    coverageRatio
  }
`;
export const CantonMedianObservationFieldsFragmentDoc = gql`
  fragment cantonMedianObservationFields on CantonMedianObservation {
    period
    canton
    cantonLabel
    category
    value(priceComponent: $priceComponent)
  }
`;
export const SwissMedianObservationFieldsFragmentDoc = gql`
  fragment swissMedianObservationFields on SwissMedianObservation {
    period
    category
    value(priceComponent: $priceComponent)
  }
`;
export const OperatorObservationWithAllPriceComponentsFieldsFragmentDoc = gql`
  fragment operatorObservationWithAllPriceComponentsFields on OperatorObservation {
    period
    municipality
    municipalityLabel
    operator
    operatorLabel
    category
    aidfee: value(priceComponent: aidfee)
    annualmeteringcost: value(priceComponent: annualmeteringcost)
    meteringrate: value(priceComponent: meteringrate)
    fixcosts: value(priceComponent: fixcosts)
    charge: value(priceComponent: charge)
    gridusage: value(priceComponent: gridusage)
    energy: value(priceComponent: energy)
    fixcostspercent: value(priceComponent: fixcostspercent)
    total: value(priceComponent: total)
  }
`;
export const CantonMedianObservationWithAllPriceComponentsFieldsFragmentDoc = gql`
  fragment cantonMedianObservationWithAllPriceComponentsFields on CantonMedianObservation {
    period
    canton
    cantonLabel
    category
    aidfee: value(priceComponent: aidfee)
    charge: value(priceComponent: charge)
    gridusage: value(priceComponent: gridusage)
    energy: value(priceComponent: energy)
    total: value(priceComponent: total)
  }
`;
export const MunicipalitiesDocument = gql`
  query Municipalities($locale: String!, $query: String, $ids: [String!]) {
    municipalities: searchMunicipalities(
      locale: $locale
      query: $query
      ids: $ids
    ) {
      id
      name
    }
  }
`;

export function useMunicipalitiesQuery(
  options: Omit<Urql.UseQueryArgs<MunicipalitiesQueryVariables>, "query">
) {
  return Urql.useQuery<MunicipalitiesQuery, MunicipalitiesQueryVariables>({
    query: MunicipalitiesDocument,
    ...options,
  });
}
export const AllMunicipalitiesDocument = gql`
  query AllMunicipalities($locale: String!) {
    municipalities: allMunicipalities(locale: $locale) {
      id
      name
    }
  }
`;

export function useAllMunicipalitiesQuery(
  options: Omit<Urql.UseQueryArgs<AllMunicipalitiesQueryVariables>, "query">
) {
  return Urql.useQuery<AllMunicipalitiesQuery, AllMunicipalitiesQueryVariables>(
    { query: AllMunicipalitiesDocument, ...options }
  );
}
export const OperatorsDocument = gql`
  query Operators($locale: String!, $query: String, $ids: [String!]) {
    operators: searchOperators(locale: $locale, query: $query, ids: $ids) {
      id
      name
    }
  }
`;

export function useOperatorsQuery(
  options: Omit<Urql.UseQueryArgs<OperatorsQueryVariables>, "query">
) {
  return Urql.useQuery<OperatorsQuery, OperatorsQueryVariables>({
    query: OperatorsDocument,
    ...options,
  });
}
export const CantonsDocument = gql`
  query Cantons($locale: String!, $query: String, $ids: [String!]) {
    cantons: searchCantons(locale: $locale, query: $query, ids: $ids) {
      id
      name
    }
  }
`;

export function useCantonsQuery(
  options: Omit<Urql.UseQueryArgs<CantonsQueryVariables>, "query">
) {
  return Urql.useQuery<CantonsQuery, CantonsQueryVariables>({
    query: CantonsDocument,
    ...options,
  });
}
export const PeerGroupsDocument = gql`
  query PeerGroups($locale: String!) {
    peerGroups(locale: $locale) {
      id
      name
    }
  }
`;

export function usePeerGroupsQuery(
  options: Omit<Urql.UseQueryArgs<PeerGroupsQueryVariables>, "query">
) {
  return Urql.useQuery<PeerGroupsQuery, PeerGroupsQueryVariables>({
    query: PeerGroupsDocument,
    ...options,
  });
}
export const SearchDocument = gql`
  query Search($locale: String!, $query: String) {
    search(locale: $locale, query: $query) {
      id
      name
    }
  }
`;

export function useSearchQuery(
  options: Omit<Urql.UseQueryArgs<SearchQueryVariables>, "query">
) {
  return Urql.useQuery<SearchQuery, SearchQueryVariables>({
    query: SearchDocument,
    ...options,
  });
}
export const ObservationsDocument = gql`
  query Observations(
    $locale: String!
    $priceComponent: PriceComponent!
    $filters: ObservationFilters!
    $observationKind: ObservationKind
  ) {
    observations(
      locale: $locale
      filters: $filters
      observationKind: $observationKind
    ) {
      ...operatorObservationFields
    }
    cantonMedianObservations(
      locale: $locale
      filters: $filters
      observationKind: $observationKind
    ) {
      ...cantonMedianObservationFields
    }
    swissMedianObservations(locale: $locale, filters: $filters) {
      ...swissMedianObservationFields
    }
  }
  ${OperatorObservationFieldsFragmentDoc}
  ${CantonMedianObservationFieldsFragmentDoc}
  ${SwissMedianObservationFieldsFragmentDoc}
`;

export function useObservationsQuery(
  options: Omit<Urql.UseQueryArgs<ObservationsQueryVariables>, "query">
) {
  return Urql.useQuery<ObservationsQuery, ObservationsQueryVariables>({
    query: ObservationsDocument,
    ...options,
  });
}
export const ObservationsWithAllPriceComponentsDocument = gql`
  query ObservationsWithAllPriceComponents(
    $locale: String!
    $filters: ObservationFilters!
    $observationKind: ObservationKind
  ) {
    observations(
      locale: $locale
      filters: $filters
      observationKind: $observationKind
    ) {
      ...operatorObservationWithAllPriceComponentsFields
    }
    cantonMedianObservations(
      locale: $locale
      filters: $filters
      observationKind: $observationKind
    ) {
      ...cantonMedianObservationWithAllPriceComponentsFields
    }
  }
  ${OperatorObservationWithAllPriceComponentsFieldsFragmentDoc}
  ${CantonMedianObservationWithAllPriceComponentsFieldsFragmentDoc}
`;

export function useObservationsWithAllPriceComponentsQuery(
  options: Omit<
    Urql.UseQueryArgs<ObservationsWithAllPriceComponentsQueryVariables>,
    "query"
  >
) {
  return Urql.useQuery<
    ObservationsWithAllPriceComponentsQuery,
    ObservationsWithAllPriceComponentsQueryVariables
  >({ query: ObservationsWithAllPriceComponentsDocument, ...options });
}
export const OperatorDocumentsDocument = gql`
  query OperatorDocuments($id: String!, $locale: String!) {
    operator(id: $id, locale: $locale) {
      name
      documents {
        id
        name
        url
        year
        category
      }
      geverDocuments {
        id
        name
        url
        year
        category
      }
    }
  }
`;

export function useOperatorDocumentsQuery(
  options: Omit<Urql.UseQueryArgs<OperatorDocumentsQueryVariables>, "query">
) {
  return Urql.useQuery<OperatorDocumentsQuery, OperatorDocumentsQueryVariables>(
    { query: OperatorDocumentsDocument, ...options }
  );
}
export const WikiContentDocument = gql`
  query WikiContent($locale: String!, $slug: String!) {
    wikiContent(locale: $locale, slug: $slug) {
      html
      info
    }
  }
`;

export function useWikiContentQuery(
  options: Omit<Urql.UseQueryArgs<WikiContentQueryVariables>, "query">
) {
  return Urql.useQuery<WikiContentQuery, WikiContentQueryVariables>({
    query: WikiContentDocument,
    ...options,
  });
}
export const OperatorMunicipalitiesDocument = gql`
  query OperatorMunicipalities($period: String!, $electricityCategory: String) {
    operatorMunicipalities(
      period: $period
      electricityCategory: $electricityCategory
    ) {
      municipality
      canton
      operator
    }
  }
`;

export function useOperatorMunicipalitiesQuery(
  options: Omit<
    Urql.UseQueryArgs<OperatorMunicipalitiesQueryVariables>,
    "query"
  >
) {
  return Urql.useQuery<
    OperatorMunicipalitiesQuery,
    OperatorMunicipalitiesQueryVariables
  >({ query: OperatorMunicipalitiesDocument, ...options });
}
export const SystemInfoDocument = gql`
  query SystemInfo {
    systemInfo {
      SPARQL_ENDPOINT
      VERSION
    }
  }
`;

export function useSystemInfoQuery(
  options?: Omit<Urql.UseQueryArgs<SystemInfoQueryVariables>, "query">
) {
  return Urql.useQuery<SystemInfoQuery, SystemInfoQueryVariables>({
    query: SystemInfoDocument,
    ...options,
  });
}
export const CubeHealthDocument = gql`
  query CubeHealth {
    cubeHealth {
      ok
      dimensions
    }
  }
`;

export function useCubeHealthQuery(
  options?: Omit<Urql.UseQueryArgs<CubeHealthQueryVariables>, "query">
) {
  return Urql.useQuery<CubeHealthQuery, CubeHealthQueryVariables>({
    query: CubeHealthDocument,
    ...options,
  });
}
export const SunshineDataDocument = gql`
  query SunshineData($filter: SunshineDataFilter!) {
    sunshineData(filter: $filter) {
      operatorId
      operatorUID
      name
      period
      francRule
      infoYesNo
      infoDaysInAdvance
      productsCount
      productsSelection
      timely
      saidiTotal
      saidiUnplanned
      saifiTotal
      saifiUnplanned
      networkCostsNE5
      networkCostsNE6
      networkCostsNE7
      tariffEC2
      tariffEC3
      tariffEC4
      tariffEC6
      tariffEH2
      tariffEH4
      tariffEH7
      tariffNC2
      tariffNC3
      tariffNC4
      tariffNC6
      tariffNH2
      tariffNH4
      tariffNH7
    }
  }
`;

export function useSunshineDataQuery(
  options: Omit<Urql.UseQueryArgs<SunshineDataQueryVariables>, "query">
) {
  return Urql.useQuery<SunshineDataQuery, SunshineDataQueryVariables>({
    query: SunshineDataDocument,
    ...options,
  });
}
export const SunshineDataByIndicatorDocument = gql`
  query SunshineDataByIndicator($filter: SunshineDataFilter!) {
    sunshineDataByIndicator(filter: $filter) {
      data {
        operatorId
        operatorUID
        name
        period
        value
      }
    }
    sunshineMedianByIndicator(filter: $filter)
  }
`;

export function useSunshineDataByIndicatorQuery(
  options: Omit<
    Urql.UseQueryArgs<SunshineDataByIndicatorQueryVariables>,
    "query"
  >
) {
  return Urql.useQuery<
    SunshineDataByIndicatorQuery,
    SunshineDataByIndicatorQueryVariables
  >({ query: SunshineDataByIndicatorDocument, ...options });
}
export const SunshineTariffDocument = gql`
  query SunshineTariff($filter: SunshineDataFilter!) {
    sunshineTariffs(filter: $filter) {
      operatorId
      operatorUID
      name
      period
      francRule
      infoYesNo
      infoDaysInAdvance
      productsCount
      productsSelection
      timely
      saidiTotal
      saidiUnplanned
      saifiTotal
      saifiUnplanned
      tariffEC2
      tariffEC3
      tariffEC4
      tariffEC6
      tariffEH2
      tariffEH4
      tariffEH7
      tariffNC2
      tariffNC3
      tariffNC4
      tariffNC6
      tariffNH2
      tariffNH4
      tariffNH7
    }
  }
`;

export function useSunshineTariffQuery(
  options: Omit<Urql.UseQueryArgs<SunshineTariffQueryVariables>, "query">
) {
  return Urql.useQuery<SunshineTariffQuery, SunshineTariffQueryVariables>({
    query: SunshineTariffDocument,
    ...options,
  });
}
export const SunshineTariffByIndicatorDocument = gql`
  query SunshineTariffByIndicator(
    $filter: SunshineDataFilter!
    $indicator: String!
  ) {
    sunshineTariffsByIndicator(filter: $filter, indicator: $indicator) {
      operatorId
      operatorUID
      name
      period
      value
    }
  }
`;

export function useSunshineTariffByIndicatorQuery(
  options: Omit<
    Urql.UseQueryArgs<SunshineTariffByIndicatorQueryVariables>,
    "query"
  >
) {
  return Urql.useQuery<
    SunshineTariffByIndicatorQuery,
    SunshineTariffByIndicatorQueryVariables
  >({ query: SunshineTariffByIndicatorDocument, ...options });
}
export const OperationalStandardsDocument = gql`
  query OperationalStandards($filter: OperationalStandardsFilter!) {
    operationalStandards(filter: $filter) {
      latestYear
      operator {
        peerGroup {
          settlementDensity
          energyDensity
        }
      }
      serviceQuality {
        notificationPeriodDays
        informingCustomersOfOutage
        operatorsNotificationPeriodDays {
          operatorId
          days
          year
        }
      }
      compliance {
        francsRule
        timelyPaperSubmission
        operatorsFrancsPerInvoice {
          operatorId
          francsPerInvoice
          year
        }
      }
      updateDate
    }
  }
`;

export function useOperationalStandardsQuery(
  options: Omit<Urql.UseQueryArgs<OperationalStandardsQueryVariables>, "query">
) {
  return Urql.useQuery<
    OperationalStandardsQuery,
    OperationalStandardsQueryVariables
  >({ query: OperationalStandardsDocument, ...options });
}
export const SaidiDocument = gql`
  query Saidi($filter: StabilityFilter!) {
    saidi(filter: $filter) {
      operatorTotal
      operatorUnplanned
      trendTotal
      trendUnplanned
      peerGroupMedianTotal
      peerGroupMedianUnplanned
      peerGroupMedianTrendTotal
      peerGroupMedianTrendUnplanned
      yearlyData {
        year
        total
        unplanned
        operator_id
        operator_name
      }
    }
  }
`;

export function useSaidiQuery(
  options: Omit<Urql.UseQueryArgs<SaidiQueryVariables>, "query">
) {
  return Urql.useQuery<SaidiQuery, SaidiQueryVariables>({
    query: SaidiDocument,
    ...options,
  });
}
export const SaifiDocument = gql`
  query Saifi($filter: StabilityFilter!) {
    saifi(filter: $filter) {
      operatorTotal
      operatorUnplanned
      trendTotal
      trendUnplanned
      peerGroupMedianTotal
      peerGroupMedianUnplanned
      peerGroupMedianTrendTotal
      peerGroupMedianTrendUnplanned
      yearlyData {
        year
        total
        unplanned
        operator_id
        operator_name
      }
    }
  }
`;

export function useSaifiQuery(
  options: Omit<Urql.UseQueryArgs<SaifiQueryVariables>, "query">
) {
  return Urql.useQuery<SaifiQuery, SaifiQueryVariables>({
    query: SaifiDocument,
    ...options,
  });
}
export const CostsAndTariffsDocument = gql`
  query CostsAndTariffs($filter: CostsAndTariffsFilter!) {
    costsAndTariffs(filter: $filter) {
      latestYear
      operator {
        peerGroup {
          id
          settlementDensity
          energyDensity
        }
      }
      networkCosts {
        networkLevel {
          id
        }
        operatorRate
        operatorTrend
        peerGroupMedianRate
        peerGroupMedianTrend
        yearlyData {
          year
          rate
          operator_id
          operator_name
          network_level
        }
      }
      netTariffs {
        category
        operatorRate
        operatorTrend
        peerGroupMedianRate
        peerGroupMedianTrend
        yearlyData {
          period
          rate
          operator_id
          operator_name
          category
        }
      }
      energyTariffs {
        category
        operatorRate
        operatorTrend
        peerGroupMedianRate
        peerGroupMedianTrend
        yearlyData {
          period
          rate
          operator_id
          operator_name
          category
        }
      }
      updateDate
    }
  }
`;

export function useCostsAndTariffsQuery(
  options: Omit<Urql.UseQueryArgs<CostsAndTariffsQueryVariables>, "query">
) {
  return Urql.useQuery<CostsAndTariffsQuery, CostsAndTariffsQueryVariables>({
    query: CostsAndTariffsDocument,
    ...options,
  });
}
export const PowerStabilityDocument = gql`
  query PowerStability($filter: PowerStabilityFilter!) {
    powerStability(filter: $filter) {
      latestYear
      operator {
        peerGroup {
          id
          settlementDensity
          energyDensity
        }
      }
      saidi {
        operatorTotal
        operatorUnplanned
        trendTotal
        trendUnplanned
        peerGroupMedianTotal
        peerGroupMedianUnplanned
        peerGroupMedianTrendTotal
        peerGroupMedianTrendUnplanned
        yearlyData {
          year
          total
          unplanned
          operator_id
          operator_name
        }
      }
      saifi {
        operatorTotal
        operatorUnplanned
        trendTotal
        trendUnplanned
        peerGroupMedianTotal
        peerGroupMedianUnplanned
        peerGroupMedianTrendTotal
        peerGroupMedianTrendUnplanned
        yearlyData {
          year
          total
          unplanned
          operator_id
          operator_name
        }
      }
      updateDate
    }
  }
`;

export function usePowerStabilityQuery(
  options: Omit<Urql.UseQueryArgs<PowerStabilityQueryVariables>, "query">
) {
  return Urql.useQuery<PowerStabilityQuery, PowerStabilityQueryVariables>({
    query: PowerStabilityDocument,
    ...options,
  });
}
export const NetworkCostsDocument = gql`
  query NetworkCosts($filter: NetworkCostsFilter!) {
    networkCosts(filter: $filter) {
      networkLevel {
        id
      }
      operatorRate
      operatorTrend
      peerGroupMedianRate
      peerGroupMedianTrend
      yearlyData {
        year
        rate
        operator_id
        operator_name
        network_level
      }
    }
  }
`;

export function useNetworkCostsQuery(
  options: Omit<Urql.UseQueryArgs<NetworkCostsQueryVariables>, "query">
) {
  return Urql.useQuery<NetworkCostsQuery, NetworkCostsQueryVariables>({
    query: NetworkCostsDocument,
    ...options,
  });
}
export const EnergyTariffsDocument = gql`
  query EnergyTariffs($filter: TariffsFilter!) {
    energyTariffs(filter: $filter) {
      category
      operatorRate
      operatorTrend
      peerGroupMedianRate
      peerGroupMedianTrend
      yearlyData {
        period
        rate
        operator_id
        operator_name
        category
      }
    }
  }
`;

export function useEnergyTariffsQuery(
  options: Omit<Urql.UseQueryArgs<EnergyTariffsQueryVariables>, "query">
) {
  return Urql.useQuery<EnergyTariffsQuery, EnergyTariffsQueryVariables>({
    query: EnergyTariffsDocument,
    ...options,
  });
}
export const NetTariffsDocument = gql`
  query NetTariffs($filter: TariffsFilter!) {
    netTariffs(filter: $filter) {
      category
      operatorRate
      operatorTrend
      peerGroupMedianRate
      peerGroupMedianTrend
      yearlyData {
        period
        rate
        operator_id
        operator_name
        category
      }
    }
  }
`;

export function useNetTariffsQuery(
  options: Omit<Urql.UseQueryArgs<NetTariffsQueryVariables>, "query">
) {
  return Urql.useQuery<NetTariffsQuery, NetTariffsQueryVariables>({
    query: NetTariffsDocument,
    ...options,
  });
}
