import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { parseResolveInfo, ResolveTree } from "graphql-parse-resolve-info";
import { parseObservation, parseObservationValue } from "../lib/observations";
import {
  getDimensionValuesAndLabels,
  getObservations,
  getOperatorDocuments,
  createSource,
  getObservationsCube,
  getCantonMedianCube,
  getView,
  getSwissMedianCube,
} from "../rdf/queries";
import {
  ResolvedCantonMedianObservation,
  ResolvedObservation,
  ResolvedOperatorObservation,
  ResolvedSwissMedianObservation,
} from "./resolver-mapped-types";
import {
  CantonMedianObservationResolvers,
  MunicipalityResolvers,
  ObservationResolvers,
  OperatorObservationResolvers,
  OperatorResolvers,
  QueryResolvers,
  Resolvers,
  ObservationKind,
  SwissMedianObservationResolvers,
} from "./resolver-types";
import { defaultLocale } from "../locales/locales";
import { getWikiPage } from "../domain/gitlab-wiki-api";
import micromark from "micromark";
import { fetchOperatorInfo, search } from "../rdf/search-queries";
var gfmSyntax = require("micromark-extension-gfm");
var gfmHtml = require("micromark-extension-gfm/html");

import * as ns from "../rdf/namespace";
import { difference } from "d3";
import { downloadGeverDocument, searchGeverDocuments } from "../domain/gever";
import { operatorIdToUID } from "./oid-uid";
import { Literal, NamedNode } from "rdf-js";

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
      observationsCube = await getObservationsCube();
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
        ? await getObservations(
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
    }));

    // Should we type-check with io-ts here? Probably not necessary because the GraphQL API will also type-check against the schema.
    return operatorObservations as ResolvedOperatorObservation[];
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
      cantonCube = await getCantonMedianCube();
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
        ? await getObservations(
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
      __typename: "MedianObservation",
      ...x,
    }));

    // Should we type-check with io-ts here? Probably not necessary because the GraphQL API will also type-check against the schema.
    return medianObservations as ResolvedCantonMedianObservation[];
  },
  swissMedianObservations: async (_, { locale, filters }, ctx, info) => {
    let cantonCube;
    try {
      cantonCube = await getSwissMedianCube();
    } catch (e: unknown) {
      const message = `${e instanceof Error ? e.message : e}`;
      console.error(message);
      throw new GraphQLError(message, {
        extensions: {
          code: "CUBE_NOT_FOUND",
        },
      });
    }

    const cantonObservationsView = getView(cantonCube);

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
        ? await getObservations(
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

    const medianObservations = rawMedianObservations.map((o) => ({
      ...o,
      __typename: "MedianObservation",
    }));

    // Should we type-check with io-ts here? Probably not necessary because the GraphQL API will also type-check against the schema.
    return medianObservations as ResolvedSwissMedianObservation[];
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
    const cube = await getObservationsCube();

    const results = await getDimensionValuesAndLabels({
      cube,
      dimensionKey: "municipality",
      filters: { municipality: [id] },
    });

    return results[0];
  },
  canton: async (_, { id }) => ({ id }),
  operator: async (_, { id, geverId }) => {
    const cube = await getObservationsCube();

    const results = await getDimensionValuesAndLabels({
      cube,
      dimensionKey: "operator",
      filters: { operator: [id] },
    });

    return { ...results[0], id, geverId: geverId || undefined };
  },
  cubeHealth: async () => {
    const cube = await getObservationsCube();
    const dimensions = cube.dimensions.map((d) => d.path.value);
    const missingDimensions = difference(expectedCubeDimensions, dimensions);
    return {
      ok: missingDimensions.size === 0,
      dimensions,
    };
  },
  wikiContent: async (_, { locale, slug }) => {
    // Exit early if home-banner is requested and it's disabled
    if (slug === "home-banner") {
      const bannerEnabled = (await getWikiPage("home"))?.content.match(
        /home_banner_enabled:\W*true/
      )
        ? true
        : false;

      if (!bannerEnabled) {
        return null;
      }
    }

    const wikiPage = await getWikiPage(`${slug}/${locale}`);

    if (!wikiPage) {
      return null;
    }

    return {
      html: micromark(wikiPage.content, {
        allowDangerousHtml: true,
        extensions: [gfmSyntax()],
        htmlExtensions: [gfmHtml],
      }),
    };
  },
};

const Municipality: MunicipalityResolvers = {
  operators: async ({ id }) => {
    const cube = await getObservationsCube();
    return getDimensionValuesAndLabels({
      cube,
      dimensionKey: "operator",
      filters: { municipality: [id] },
    });
  },
};

const Operator: OperatorResolvers = {
  municipalities: async ({ id }) => {
    const cube = await getObservationsCube();

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
    const operatorInfo = await fetchOperatorInfo({ operatorId });
    const uid = operatorInfo?.uid;
    try {
      const docs = await searchGeverDocuments({
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
};

// const Canton: CantonResolvers = {
//   name: (canton) => MOCK_DATA.cantons[canton.id].name,
//   municipalities: (canton) => {
//     return Object.values(MOCK_DATA.municipalities).filter(
//       (m) => m.canton === canton.id
//     );
//   },
//
// };

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
