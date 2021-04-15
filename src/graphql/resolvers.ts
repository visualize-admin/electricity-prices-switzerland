import { GraphQLResolveInfo } from "graphql";
import { parseResolveInfo, ResolveTree } from "graphql-parse-resolve-info";
import { parseObservationValue } from "../lib/observations";
import {
  getDimensionValuesAndLabels,
  getObservations,
  search,
  stripNamespaceFromIri,
  getOperatorDocuments,
  getSourceAndCubeViews,
  createSource,
} from "../rdf/queries";
import { ResolvedObservation } from "./resolver-mapped-types";
import {
  MedianObservationResolvers,
  MunicipalityResolvers,
  ObservationResolvers,
  OperatorObservationResolvers,
  OperatorResolvers,
  QueryResolvers,
  Resolvers,
  ObservationType,
} from "./resolver-types";
import { defaultLocale } from "../locales/locales";
import { getWikiPage } from "../domain/gitlab-wiki-api";
import micromark from "micromark";
var gfmSyntax = require("micromark-extension-gfm");
var gfmHtml = require("micromark-extension-gfm/html");

const Query: QueryResolvers = {
  systemInfo: async () => {
    return {
      SPARQL_ENDPOINT:
        process.env.SPARQL_ENDPOINT ?? "https://test.lindas.admin.ch/query",
      VERSION: process.env.VERSION!,
    };
  },
  observations: async (_, { locale, filters, observationType }, ctx, info) => {
    const {
      source,
      observationsView,
      cantonObservationsView,
    } = await getSourceAndCubeViews();
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
      observationType !== ObservationType.MedianObservation &&
      observationDimensionKeys.length > 0
        ? await getObservations(
            { view: observationsView, source, locale: locale ?? defaultLocale },
            {
              filters,
              dimensions: observationDimensionKeys,
            }
          )
        : [];

    const medianObservationFields = getResolverFields(
      info,
      "MedianObservation"
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
      observationType !== ObservationType.OperatorObservation &&
      medianDimensionKeys.length > 0
        ? await getObservations(
            {
              view: cantonObservationsView,
              source,
              isCantons: true,
              locale: locale ?? defaultLocale,
            },
            {
              filters,
              dimensions: medianDimensionKeys,
            }
          )
        : [];

    const operatorObservations = rawOperatorObservations.map((d) => {
      let parsed: { [k: string]: string | number | boolean } = {
        __typename: "OperatorObservation",
      };
      for (const [k, v] of Object.entries(d)) {
        const key = k
          .replace(
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/",
            ""
          )
          .replace(
            "https://energy.ld.admin.ch/elcom/electricity-price/dimension/",
            ""
          );
        const parsedValue = parseObservationValue(v);

        parsed[key] =
          typeof parsedValue === "string"
            ? stripNamespaceFromIri({ dimension: key, iri: parsedValue })
            : parsedValue;
      }
      return parsed;
    });
    const medianObservations = rawMedianObservations.map((d) => {
      let parsed: { [k: string]: string | number | boolean } = {
        __typename: "MedianObservation",
      };
      for (const [k, v] of Object.entries(d)) {
        const key = k
          .replace(
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/",
            ""
          )
          .replace(
            "https://energy.ld.admin.ch/elcom/electricity-price/dimension/",
            ""
          );
        const parsedValue = parseObservationValue(v);

        parsed[key] =
          typeof parsedValue === "string"
            ? stripNamespaceFromIri({ dimension: key, iri: parsedValue })
            : parsedValue;
      }
      return parsed;
    });

    console.log(medianObservations[0], operatorObservations[0]);

    const observations = [...medianObservations, ...operatorObservations];

    // Should we type-check with io-ts here? Probably not necessary because the GraphQL API will also type-check against the schema.
    return observations as ResolvedObservation[];
  },
  operators: async (_, { query, ids, locale }) => {
    const { source, observationsView: view } = await getSourceAndCubeViews();
    const results = await search({
      source,
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["operator"],
    });

    return results.map((r) => ({ ...r, source, view }));
  },
  municipalities: async (_, { query, ids, locale }) => {
    const { source, observationsView: view } = await getSourceAndCubeViews();
    const results = await search({
      source,
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["municipality"],
    });

    return results.map((r) => ({ ...r, source, view }));
  },
  cantons: async (_, { query, ids, locale }) => {
    const { source, observationsView: view } = await getSourceAndCubeViews();

    const results = await search({
      source,
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["canton"],
    });

    return results.map((r) => ({ ...r, source, view }));
  },
  search: async (_, { query, locale }) => {
    const source = createSource();
    const results = await search({
      source,
      locale,
      query: query ?? "",
      ids: [],
      types: ["municipality", "operator", "canton"],
    });

    return results;
  },
  searchMunicipalities: async (_, { query, locale, ids }) => {
    const source = createSource();
    const results = await search({
      source,
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["municipality"],
    });

    return results;
  },
  searchOperators: async (_, { query, locale, ids }) => {
    const source = createSource();
    const results = await search({
      source,
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["operator"],
    });

    return results;
  },
  searchCantons: async (_, { query, locale, ids }) => {
    const source = createSource();
    const results = await search({
      source,
      locale,
      query: query ?? "",
      ids: ids ?? [],
      types: ["canton"],
    });

    return results;
  },
  municipality: async (_, { id }) => {
    const { source, observationsView: view } = await getSourceAndCubeViews();

    const results = await getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "municipality",
      filters: { municipality: [id] },
    });

    return results[0];
  },
  canton: async (_, { id }) => ({ id }),
  operator: async (_, { id }) => {
    const { source, observationsView: view } = await getSourceAndCubeViews();

    const results = await getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "operator",
      filters: { operator: [id] },
    });

    return results[0];
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
  operators: async ({ id, view, source }) => {
    return getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "operator",
      filters: { municipality: [id] },
    });
  },
};

const Operator: OperatorResolvers = {
  municipalities: async ({ id, view, source }) => {
    return getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "municipality",
      filters: { operator: [id] },
    });
  },

  documents: async ({ id, source }) => {
    return getOperatorDocuments({ operatorId: id, source });
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

const MedianObservation: MedianObservationResolvers = {
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
  MedianObservation,
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
