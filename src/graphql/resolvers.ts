import { GraphQLResolveInfo } from "graphql";
import { parseResolveInfo, ResolveTree } from "graphql-parse-resolve-info";
import { parseObservationValue } from "../lib/observations";
import {
  getDimensionValuesAndLabels,
  getObservations,
  search,
  stripNamespaceFromIri,
} from "./rdf";
import { ResolvedObservation } from "./resolver-mapped-types";
import {
  MedianObservationResolvers,
  MunicipalityResolvers,
  ObservationResolvers,
  ProviderObservationResolvers,
  ProviderResolvers,
  QueryResolvers,
  Resolvers,
} from "./resolver-types";

const Query: QueryResolvers = {
  observations: async (
    _,
    { locale, filters },
    { source, observationsView, cantonObservationsView },
    info
  ) => {
    // Look ahead to select proper dimensions for query
    const observationFields = getResolverFields(info, "ProviderObservation");

    const observationDimensionKeys = observationFields
      ? Object.values<ResolveTree>(observationFields).map((fieldInfo) => {
          return (
            (fieldInfo.args.priceComponent as string) ??
            fieldInfo.name.replace(/^canton/, "region")
          );
        })
      : [];

    const rawProviderObservations =
      observationDimensionKeys.length > 0
        ? await getObservations(
            { view: observationsView, source },
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
            fieldInfo.name.replace(/^canton/, "region")
          );
        })
      : [];

    const rawMedianObservations =
      medianDimensionKeys.length > 0
        ? await getObservations(
            { view: cantonObservationsView, source },
            {
              filters,
              dimensions: medianDimensionKeys,
            }
          )
        : [];

    const providerObservations = rawProviderObservations.map((d) => {
      let parsed: { [k: string]: string | number | boolean } = {
        __typename: "ProviderObservation",
      };
      for (const [k, v] of Object.entries(d)) {
        const key = k.replace(
          "https://energy.ld.admin.ch/elcom/energy-pricing/dimension/",
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
        const key = k.replace(
          "https://energy.ld.admin.ch/elcom/energy-pricing/dimension/",
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

    const observations = [...medianObservations, ...providerObservations];

    // Should we type-check with io-ts here? Probably not necessary because the GraphQL API will also type-check against the schema.
    return observations as ResolvedObservation[];
  },
  providers: async (_, { query, ids }, { source, observationsView: view }) => {
    const results = await search({
      source,
      query: query ?? "",
      ids: ids ?? [],
      types: ["provider"],
    });

    return results.map((r) => ({ ...r, source, view }));
  },
  municipalities: async (
    _,
    { query, ids },
    { source, observationsView: view }
  ) => {
    const results = await search({
      source,
      query: query ?? "",
      ids: ids ?? [],
      types: ["municipality"],
    });

    return results.map((r) => ({ ...r, source, view }));
  },
  cantons: async (_, { query, ids }, { source, observationsView: view }) => {
    const results = await search({
      source,
      query: query ?? "",
      ids: ids ?? [],
      types: ["canton"],
    });

    return results.map((r) => ({ ...r, source, view }));
  },
  search: async (_, { query }, { source }) => {
    const results = await search({
      source,
      query: query ?? "",
      ids: [],
      types: ["municipality", "provider", "canton"],
    });

    return results;
  },
  municipality: async (_, { id }, { source, observationsView: view }) => {
    const results = await getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "municipality",
      filters: { municipality: [id] },
    });

    return results[0];
  },
  canton: async (_, { id }) => ({ id }),
  provider: async (_, { id }, { source, observationsView: view }) => {
    const results = await getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "provider",
      filters: { provider: [id] },
    });

    return results[0];
  },
};

const Municipality: MunicipalityResolvers = {
  providers: async ({ id, view, source }) => {
    return getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "provider",
      filters: { municipality: [id] },
    });
  },
  priceComponents: () => {
    return { total: 100 };
  },
};

const Provider: ProviderResolvers = {
  municipalities: async ({ id, view, source }) => {
    return getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "municipality",
      filters: { provider: [id] },
    });
  },
  priceComponents: () => {
    return { total: 63 };
  },
};

// const Canton: CantonResolvers = {
//   name: (canton) => MOCK_DATA.cantons[canton.id].name,
//   municipalities: (canton) => {
//     return Object.values(MOCK_DATA.municipalities).filter(
//       (m) => m.canton === canton.id
//     );
//   },
//   priceComponents: () => {
//     return { total: 85 };
//   },
// };

const getResolverFields = (info: GraphQLResolveInfo, type: string) => {
  const resolveInfo = parseResolveInfo(info);

  if (resolveInfo) {
    const fieldMap = resolveInfo.fieldsByTypeName[type];
    console.log(fieldMap);
    return fieldMap as { [s: string]: ResolveTree };
  }

  return undefined;
};

const Observation: ObservationResolvers = {
  __resolveType: (obj) => obj.__typename,
};

const ProviderObservation: ProviderObservationResolvers = {
  /**
   * Since the value field can be aliased and is commonly used multiple times _and_
   * we return all values from the parent resolver keyed by priceComponent (e.g. `{ total: 12.3, energy: 4.5 }`),
   * it's necessary to resolve these values again here by returning the correct priceComponent value
   * to ensure that field aliases are properly resolved.
   */
  value: (parent, args) => {
    return parent[args.priceComponent];
  },
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
  canton: (parent) => parent.region!,
  cantonLabel: (parent) => parent.regionLabel!,
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
  Provider,
  Observation,
  ProviderObservation,
  MedianObservation,
  // Canton,
  SearchResult: {
    __resolveType: (obj) => {
      switch (obj.type) {
        case "municipality":
          return "MunicipalityResult";
        case "provider":
          return "ProviderResult";
        case "canton":
          return "CantonResult";
        default:
          throw Error("Could not resolve type of Entity");
      }
    },
  },
};
