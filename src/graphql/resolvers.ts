import { difference } from "d3";
import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { parseResolveInfo, ResolveTree } from "graphql-parse-resolve-info";
import micromark from "micromark";
import type { IndicatorMedianParams } from "src/lib/sunshine-data";
import type { PeerGroupRecord } from "src/lib/sunshine-data-service";

import { searchGeverDocuments } from "src/domain/gever";
import { getWikiPage } from "src/domain/gitlab-wiki-api";
import {
  ResolvedCantonMedianObservation,
  ResolvedOperatorObservation,
  ResolvedSwissMedianObservation,
  ElectricityCategory,
} from "src/graphql/resolver-mapped-types";
import {
  CantonMedianObservationResolvers,
  MunicipalityResolvers,
  ObservationKind,
  ObservationResolvers,
  OperatorObservationResolvers,
  OperatorResolvers,
  QueryResolvers,
  Resolvers,
  SunshineDataFilter,
  SwissMedianObservationResolvers,
} from "src/graphql/resolver-types";
import {
  fetchEnergyTariffsData,
  fetchNetTariffsData,
  fetchNetworkCostsData,
  fetchOperationalStandards,
  fetchSaidi,
  fetchSaifi,
} from "src/lib/sunshine-data";
import { defaultLocale } from "src/locales/config";
import {
  getElectricityPriceCantonCube,
  getDimensionValuesAndLabels,
  getElectricityPriceObservations,
  getElectricityPriceCube,
  getOperatorDocuments,
  getElectricityPriceSwissCube,
  getView,
} from "src/rdf/queries";
import { fetchOperatorInfo, search } from "src/rdf/search-queries";
import { asElectricityCategory } from "src/domain/data";
import { asNetworkLevel } from "src/domain/sunshine";
import { last, sortBy } from "lodash";
import { CoverageCacheManager } from "src/rdf/coverage-ratio";
import { sparqlClient } from "src/rdf/sparql-client";

const gfmSyntax = require("micromark-extension-gfm");
const gfmHtml = require("micromark-extension-gfm/html");

const expectedCubeDimensions = [
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/aidfee",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/charge",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/energy",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/fixcosts",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/fixcostspercent",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/gridusage",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/total",
  "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product",
  "https://cube.link/observedBy",
];

const Query: QueryResolvers = {
  sunshineData: async (_parent, args, context) => {
    const { filter } = args;
    const sunshineData = await context.sunshineDataService.getSunshineData(
      filter
    );
    return sunshineData;
  },
  sunshineDataByIndicator: async (_parent, args, context) => {
    const { filter } = args;

    if (!filter.indicator) {
      throw new GraphQLError("Indicator is required", {
        extensions: { code: "MISSING_INDICATOR" },
      });
    }

    const sunshineData =
      await context.sunshineDataService.getSunshineDataByIndicator({
        operatorId: filter.operatorId,
        period: filter.period,
        peerGroup: filter.peerGroup,
        indicator: filter.indicator as any, // We'll need to properly type this
        category: filter.category ?? undefined,
        networkLevel: filter.networkLevel ?? undefined,
        typology: filter.typology ?? undefined,
      });

    // Get median from the service using the new structured filter
    let medianValue = 0;
    try {
      const medianParams = createIndicatorMedianParams(filter);
      if (medianParams) {
        const medianRows = sortBy(
          await context.sunshineDataService.getYearlyIndicatorMedians(
            medianParams
          ),
          (x) => x.period
        );
        const medianResult = filter.period
          ? medianRows.find((x) => `${x.period}` === filter.period!)
          : last(medianRows);
        medianValue =
          getMedianValueFromResult(
            medianResult,
            filter.indicator!,
            filter.typology ?? undefined
          ) ?? 0;
      } else {
        throw new GraphQLError(
          `Unsupported indicator for median calculation: ${filter.indicator}`,
          {
            extensions: { code: "UNSUPPORTED_INDICATOR" },
          }
        );
      }
    } catch (_error) {
      throw new GraphQLError(
        `Failed to calculate median for indicator ${filter.indicator}: ${
          _error instanceof Error ? _error.message : _error
        }`,
        {
          extensions: { code: "MEDIAN_CALCULATION_ERROR" },
        }
      );
    }

    return {
      data: sunshineData,
      median: medianValue,
    };
  },
  sunshineTariffs: async (_parent, args, context) => {
    const { filter } = args;
    if (!filter.operatorId && !filter.period) {
      throw new Error("Must either filter by year or by provider.");
    }
    const sunshineData = await context.sunshineDataService.getSunshineData(
      filter
    );
    return sunshineData;
  },
  sunshineTariffsByIndicator: async (_parent, args, context) => {
    const { filter, indicator } = args;
    if (!filter.operatorId && !filter.period) {
      throw new Error("Must either filter by year or by provider.");
    }
    const sunshineData =
      await context.sunshineDataService.getSunshineDataByIndicator({
        operatorId: filter.operatorId,
        period: filter.period,
        peerGroup: filter.peerGroup,
        indicator: indicator as any, // Temporary cast for backward compatibility
      });
    return sunshineData;
  },
  systemInfo: async () => {
    return {
      SPARQL_ENDPOINT:
        process.env.SPARQL_ENDPOINT ?? "https://test.lindas.admin.ch/query",
      VERSION: process.env.VERSION!,
    };
  },
  observations: async (_, { locale, filters, observationKind }, ctx, info) => {
    if (observationKind && observationKind !== ObservationKind.Municipality) {
      return null;
    }

    let observationsCube;
    try {
      observationsCube = await getElectricityPriceCube();
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : e);
      return [];
    }

    const observationsView = getView(observationsCube);

    // Look ahead to select proper dimensions for query
    const observationFields = getResolverFields(info, "OperatorObservation");

    const observationDimensionKeys = observationFields
      ? Object.values<ResolveTree>(observationFields).map((fieldInfo) => {
          return (
            (fieldInfo.args.priceComponent as string) ??
            // fieldInfo.name.replace(/^canton/, "region")
            fieldInfo.name
          );
        })
      : [];

    const rawOperatorObservations =
      observationDimensionKeys.length > 0
        ? await getElectricityPriceObservations(
            {
              view: observationsView,
              source: observationsCube.source,
              locale: locale ?? defaultLocale,
            },
            {
              filters,
              dimensions: observationDimensionKeys,
            }
          )
        : [];

    const operatorObservations = rawOperatorObservations.map((o) => ({
      __typename: "OperatorObservation",
      ...o,
    })) as ResolvedOperatorObservation[];

    const years = filters?.period;
    if (years && observationFields && "coverageRatio" in observationFields) {
      const start = Date.now();
      console.log(`Preparing coverage data for years: ${years.join(", ")}`);
      const defaultNetworkLevel = "NE7";
      const coverageManager = new CoverageCacheManager(sparqlClient);
      await coverageManager.prepare(years);
      const end = Date.now();
      console.log(
        `Finished preparing coverage data for years: ${years.join(", ")} in ${
          end - start
        }ms`
      );
      console.log(`Coverage data prepared in ${end - start}ms`);
      operatorObservations.forEach((x) => {
        x.coverageRatio =
          coverageManager.getCoverage(x, defaultNetworkLevel) ?? 1;
        return x;
      });
    }
    return operatorObservations;
  },
  cantonMedianObservations: async (
    _,
    { locale, filters, observationKind },
    ctx,
    info
  ) => {
    if (observationKind && observationKind !== ObservationKind.Canton) {
      return null;
    }

    let cantonCube;
    try {
      cantonCube = await getElectricityPriceCantonCube();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : `${e}`;
      console.error(message);
      throw new GraphQLError(message, {
        extensions: { code: "CUBE_NOT_FOUND" },
      });
    }

    const cantonObservationsView = getView(cantonCube);

    // Look ahead to select proper dimensions for query
    const medianObservationFields = getResolverFields(
      info,
      "CantonMedianObservation"
    );

    const medianDimensionKeys = medianObservationFields
      ? Object.values<ResolveTree>(medianObservationFields).map((fieldInfo) => {
          return (
            (fieldInfo.args.priceComponent as string) ??
            // fieldInfo.name.replace(/^canton/, "region")
            fieldInfo.name
          );
        })
      : [];

    const rawMedianObservations =
      medianDimensionKeys.length > 0
        ? await getElectricityPriceObservations(
            {
              view: cantonObservationsView,
              source: cantonCube.source,
              isCantons: true,
              locale: locale ?? defaultLocale,
            },
            {
              filters,
              dimensions: medianDimensionKeys,
            }
          )
        : [];

    const medianObservations = rawMedianObservations.map((x) => ({
      __typename: "CantonMedianObservation",
      ...x,
    })) as ResolvedCantonMedianObservation[];

    return medianObservations;
  },
  swissMedianObservations: async (_, { locale, filters }, ctx, info) => {
    let swissCube;
    try {
      swissCube = await getElectricityPriceSwissCube();
    } catch (e: unknown) {
      const message = `${e instanceof Error ? e.message : e}`;
      console.error(message);
      throw new GraphQLError(message, {
        extensions: {
          code: "CUBE_NOT_FOUND",
        },
      });
    }

    const swissObservationsView = getView(swissCube);

    // Look ahead to select proper dimensions for query
    const medianObservationFields = getResolverFields(
      info,
      "SwissMedianObservation"
    );

    const medianDimensionKeys = medianObservationFields
      ? Object.values<ResolveTree>(medianObservationFields).map((fieldInfo) => {
          return (
            (fieldInfo.args.priceComponent as string) ??
            // fieldInfo.name.replace(/^canton/, "region")
            fieldInfo.name
          );
        })
      : [];

    const rawMedianObservations =
      medianDimensionKeys.length > 0
        ? await getElectricityPriceObservations(
            {
              view: swissObservationsView,
              source: swissCube.source,
              isCantons: true,
              locale: locale ?? defaultLocale,
            },
            {
              filters,
              dimensions: medianDimensionKeys,
            }
          )
        : [];

    const medianObservations = rawMedianObservations.map((o) => ({
      ...o,
      __typename: "SwissMedianObservation",
    })) as ResolvedSwissMedianObservation[];

    return medianObservations;
  },
  operators: async (_, { query, ids, locale }) => {
    const results = await search({
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["operator"],
    });

    return results;
  },
  municipalities: async (_, { query, ids, locale }) => {
    const results = await search({
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["municipality"],
    });

    return results;
  },
  cantons: async (_, { query, ids, locale }) => {
    const results = await search({
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["canton"],
    });

    return results;
  },
  search: async (_, { query, locale }) => {
    const results = await search({
      locale,
      query: query ?? "",
      ids: [],
      types: ["municipality", "operator", "canton"],
    });

    return results;
  },
  searchMunicipalities: async (_, { query, locale, ids }) => {
    const results = await search({
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["municipality"],
    });

    return results;
  },
  allMunicipalities: async (_, { locale }) => {
    const results = await search({
      locale,
      query: ".*",
      ids: [],
      limit: 5000,
      types: ["municipality"],
    });

    return results;
  },
  searchOperators: async (_, { query, locale, ids }) => {
    const results = await search({
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["operator"],
    });

    return results;
  },
  searchCantons: async (_, { query, locale, ids }) => {
    const results = await search({
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["canton"],
    });

    return results;
  },
  municipality: async (_, { id }) => {
    const cube = await getElectricityPriceCube();

    const results = await getDimensionValuesAndLabels({
      cube,
      dimensionKey: "municipality",
      filters: { municipality: [id] },
    });

    return results[0];
  },
  canton: async (_, { id }) => ({ id }),
  operator: async (_, { id, geverId }) => {
    const cube = await getElectricityPriceCube();

    const results = await getDimensionValuesAndLabels({
      cube,
      dimensionKey: "operator",
      filters: { operator: [id] },
    });

    return { ...results[0], id, geverId: geverId || undefined };
  },
  cubeHealth: async () => {
    const cube = await getElectricityPriceCube();
    const dimensions = cube.dimensions.map((d) => d.path.value);
    const missingDimensions = difference(expectedCubeDimensions, dimensions);
    return {
      ok: missingDimensions.size === 0,
      dimensions,
    };
  },
  wikiContent: async (_, { locale, slug }) => {
    // Exit early if home-banner is requested and it's disabled
    const extraInfo = await getExtraInfo(slug);
    const wikiPage = await getWikiPage(
      `${slug}/${locale === "en" ? "de" : locale}`
    );

    if (!wikiPage) {
      return null;
    }

    return {
      info: extraInfo,
      html: micromark(wikiPage.content, {
        allowDangerousHtml: true,
        extensions: [gfmSyntax()],
        htmlExtensions: [gfmHtml],
      }),
    };
  },
  networkCosts: async (_, { filter }, context) => {
    return await fetchNetworkCostsData(context.sunshineDataService, {
      operatorId: filter.operatorId,
      networkLevel: filter.networkLevel
        ? asNetworkLevel(filter.networkLevel)
        : undefined,
      period: filter.period,
      operatorOnly: filter.operatorOnly ?? undefined,
    });
  },
  netTariffs: async (_, { filter }, context) => {
    return await fetchNetTariffsData(context.sunshineDataService, {
      operatorId: filter.operatorId,
      category: asElectricityCategory(filter.category as ElectricityCategory),
      period: filter.period,
      operatorOnly: filter.operatorOnly ?? undefined,
    });
  },
  energyTariffs: async (_, { filter }, context) => {
    return await fetchEnergyTariffsData(context.sunshineDataService, {
      operatorId: filter.operatorId,
      category: asElectricityCategory(filter.category),
      period: filter.period,
      operatorOnly: filter.operatorOnly ?? undefined,
    });
  },
  saidi: async (_, { filter }, context) => {
    return await fetchSaidi(context.sunshineDataService, {
      operatorId: filter.operatorId,
      period: filter.year,
    });
  },
  saifi: async (_, { filter }, context) => {
    return await fetchSaifi(context.sunshineDataService, {
      operatorId: filter.operatorId,
      period: filter.year,
    });
  },
  operationalStandards: async (_, { filter }, context) => {
    return await fetchOperationalStandards(context.sunshineDataService, {
      operatorId: filter.operatorId.toString(),
      period: filter.period,
    });
  },
};

const getExtraInfo = async (slug: string) => {
  if (slug === "home-banner") {
    const bannerEnabled = (await getWikiPage("home"))?.content.match(
      /home_banner_enabled:\W*true/
    );
    return { bannerEnabled };
  } else {
    return {};
  }
};

const Municipality: MunicipalityResolvers = {
  operators: async ({ id }) => {
    const cube = await getElectricityPriceCube();
    return getDimensionValuesAndLabels({
      cube,
      dimensionKey: "operator",
      filters: { municipality: [id] },
    });
  },
};

const Operator: OperatorResolvers = {
  municipalities: async ({ id }) => {
    const cube = await getElectricityPriceCube();

    return getDimensionValuesAndLabels({
      cube,
      dimensionKey: "municipality",
      filters: { operator: [id] },
    });
  },

  documents: async ({ id }) => {
    return getOperatorDocuments({ operatorId: id });
  },

  geverDocuments: async ({ id: operatorId }) => {
    const { data: operatorInfo } = await fetchOperatorInfo({ operatorId });
    const uid = operatorInfo?.uid;
    try {
      const { docs } = await searchGeverDocuments({
        operatorId,
        uid,
      });
      return docs || [];
    } catch (e) {
      console.warn(
        "Could not search documents",
        e instanceof Error ? e.message : e
      );
      return [];
    }
  },

  peerGroup: async ({ id }, args, context) => {
    const peerGroups = await context.sunshineDataService.getPeerGroup(id);
    return peerGroups;
  },
};

const getResolverFields = (info: GraphQLResolveInfo, type: string) => {
  const resolveInfo = parseResolveInfo(info);

  if (resolveInfo) {
    const fieldMap = resolveInfo.fieldsByTypeName[type];
    return fieldMap as { [s: string]: ResolveTree };
  }

  return undefined;
};

const Observation: ObservationResolvers = {
  __resolveType: (obj) => obj.__typename,
};

const OperatorObservation: OperatorObservationResolvers = {
  /**
   * Since the value field can be aliased and is commonly used multiple times _and_
   * we return all values from the parent resolver keyed by priceComponent (e.g. `{ total: 12.3, energy: 4.5 }`),
   * it's necessary to resolve these values again here by returning the correct priceComponent value
   * to ensure that field aliases are properly resolved.
   */
  value: (parent, args) => {
    return parent[args.priceComponent];
  },
  /**
   * Map "region*" to "canton*" field name
   */
  canton: (parent) => parent.region!,
  cantonLabel: (parent) => parent.regionLabel!,
};

const CantonMedianObservation: CantonMedianObservationResolvers = {
  /**
   * Since the value field can be aliased and is commonly used multiple times _and_
   * we return all values from the parent resolver keyed by priceComponent (e.g. `{ total: 12.3, energy: 4.5 }`),
   * it's necessary to resolve these values again here by returning the correct priceComponent value
   * to ensure that field aliases are properly resolved.
   */
  value: (parent, args) => {
    return parent[args.priceComponent];
  },
  /**
   * Map "region*" to "canton*" field name
   */
  // canton: (parent) => parent.canton,
  // cantonLabel: (parent) => parent.cantonLabel,
};

const SwissMedianObservation: SwissMedianObservationResolvers = {
  /**
   * Since the value field can be aliased and is commonly used multiple times _and_
   * we return all values from the parent resolver keyed by priceComponent (e.g. `{ total: 12.3, energy: 4.5 }`),
   * it's necessary to resolve these values again here by returning the correct priceComponent value
   * to ensure that field aliases are properly resolved.
   */
  value: (parent, args) => {
    return parent[args.priceComponent];
  },
  /**
   * Map "region*" to "canton*" field name
   */
  // canton: (parent) => parent.canton,
  // cantonLabel: (parent) => parent.cantonLabel,
};

// const Cube: CubeResolvers = {
//   iri: ({ cube }) => cube.term?.value ?? "???",
//   name: ({ cube, locale }) => {
//     return getName(cube, { locale });
//   },
//   dimensionPeriod: ({ view, locale }) => {
//     return getCubeDimension(view, "period", { locale });
//   },

// };

export const resolvers: Resolvers = {
  Query,
  Municipality,
  Operator,
  Observation,
  OperatorObservation,
  CantonMedianObservation,
  SwissMedianObservation,
  // Canton,
  SearchResult: {
    __resolveType: (obj) => {
      switch (obj.type) {
        case "municipality":
          return "MunicipalityResult";
        case "operator":
          return "OperatorResult";
        case "canton":
          return "CantonResult";
        default:
          throw Error("Could not resolve type of Entity");
      }
    },
  },
};

// Helper function to create indicator median params from structured filter
const createIndicatorMedianParams = (
  filter: SunshineDataFilter
): IndicatorMedianParams | null => {
  if (!filter.indicator) return null;

  const periodNum = filter.period ? parseInt(filter.period, 10) : undefined;
  const peerGroup = filter.peerGroup ? filter.peerGroup : undefined;

  // Network costs indicators
  if (filter.indicator === "networkCosts" && filter.networkLevel) {
    return {
      metric: "network_costs" as const,
      networkLevel: filter.networkLevel as "NE5" | "NE6" | "NE7",
      period: periodNum,
      peerGroup,
    };
  }

  // Stability indicators
  if (filter.indicator === "saidi" || filter.indicator === "saifi") {
    return {
      metric: "stability" as const,
      period: periodNum,
      peerGroup,
    };
  }

  // Operational indicators
  if (
    filter.indicator === "serviceQuality" ||
    filter.indicator === "compliance"
  ) {
    return {
      metric: "operational" as const,
      period: periodNum,
      peerGroup,
    };
  }

  // Energy tariff indicators
  if (filter.indicator === "energyTariffs" && filter.category) {
    return {
      metric: "energy-tariffs" as const,
      category: filter.category as ElectricityCategory,
      period: periodNum,
      peerGroup,
    };
  }

  // Network tariff indicators
  if (filter.indicator === "netTariffs" && filter.category) {
    return {
      metric: "net-tariffs" as const,
      category: filter.category as ElectricityCategory,
      period: periodNum,
      peerGroup: peerGroup,
    };
  }

  return null;
};

// Helper function to extract median value from service result
const getMedianValueFromResult = (
  result: PeerGroupRecord<any> | undefined,
  indicator: string,
  typology?: string
): number | undefined => {
  if (!result) return undefined;

  // Network costs
  if (indicator === "networkCosts") {
    return (result as any).median_value;
  }

  // Stability metrics
  if (indicator === "saidi") {
    return typology === "unplanned"
      ? (result as any).median_saidi_unplanned
      : (result as any).median_saidi_total;
  }
  if (indicator === "saifi") {
    return typology === "unplanned"
      ? (result as any).median_saifi_unplanned
      : (result as any).median_saifi_total;
  }

  // Operational metrics
  if (indicator === "compliance") {
    // For service quality/compliance, we might need to aggregate multiple metrics
    return (
      (result as any).median_franc_rule ?? (result as any).median_info_days
    );
  }

  if (indicator === "serviceQuality") {
    // For service quality/compliance, we might need to aggregate multiple metrics
    return (result as any).median_timely;
  }

  // Tariffs (both energy and network)
  if (indicator === "energyTariffs" || indicator === "netTariffs") {
    return (result as any).median_rate;
  }

  return undefined;
};
