import { parseResolveInfo, ResolveTree } from "graphql-parse-resolve-info";
import { parseObservationValue } from "../lib/observations";
import {
  buildDimensionFilter,
  getCubeDimension,
  getName,
  getObservations,
  getSource,
  getView,
  getDimensionValuesAndLabels,
  getMunicipalities,
} from "./rdf";
import {
  CantonResolvers,
  CubeResolvers,
  MunicipalityResolvers,
  ProviderResolvers,
  QueryResolvers,
  Resolvers,
  ObservationResolvers,
} from "./resolver-types";
import { defaultLocale } from "../locales/locales";
import { GraphQLResolveInfo } from "graphql";
import { ResolvedObservation } from "./shared-types";

const Query: QueryResolvers = {
  cubes: async (_, { locale }) => {
    const source = getSource();
    const cubes = await source.cubes();
    return cubes.map((cube) => ({
      locale: locale ?? defaultLocale,
      cube,
      view: getView(cube),
      source,
    }));
  },
  cubeByIri: async (_, { locale, iri }) => {
    const source = getSource();
    const cube = await source.cube(iri);

    if (!cube) {
      return null;
    }

    return {
      locale: locale ?? defaultLocale,
      cube,
      view: getView(cube),
      source,
    };
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
    return getMunicipalities({
      view,
      source,
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
    return fieldMap;
  }

  return undefined;
};

const Observation: ObservationResolvers = {
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

const Cube: CubeResolvers = {
  iri: ({ cube }) => cube.term?.value ?? "???",
  name: ({ cube, locale }) => {
    return getName(cube, { locale });
  },
  dimensionPeriod: ({ view, locale }) => {
    return getCubeDimension(view, "period", { locale });
  },
  observations: async ({ view, source, locale }, { filters }, ctx, info) => {
    // Look ahead to select proper dimensions for query
    const resolverFields = getResolverFields(info, "Observation");

    const dimensionKeys = Object.values<ResolveTree>(
      resolverFields! as $FixMe
    ).map((fieldInfo) => {
      return (fieldInfo.args.priceComponent as string) ?? fieldInfo.name;
    });

    const rawObservations = await getObservations(
      { view, source },
      {
        filters,
        dimensions: dimensionKeys,
      }
    );

    const observations = rawObservations.map((d) => {
      let parsed: { [k: string]: string | number | boolean } = {};
      for (const [k, v] of Object.entries(d)) {
        const key = k.replace(
          "https://energy.ld.admin.ch/elcom/energy-pricing/dimension/",
          ""
        );

        parsed[key] = parseObservationValue(v);
      }
      return parsed;
    });

    // Should we type-check with io-ts here? Probably not necessary because the GraphQL API will also type-check against the schema.
    return observations as ResolvedObservation[];
  },
  providers: async ({ view, source }) => {
    return getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "provider",
    });
  },
  cantons: async () => [{ id: "1" }, { id: "2" }],
  municipalities: async ({ view, source }) => {
    return getMunicipalities({
      view,
      source,
    });
  },
  municipality: async ({ view, source }, { id }) => {
    const results = await getMunicipalities({
      view,
      source,
      filters: { municipality: [id] },
    });

    return results[0];
  },
  canton: async (_, { id }) => ({ id }),
  provider: async ({ view, source }, { id }) => {
    const results = await getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "provider",
      filters: { provider: [id] },
    });

    return results[0];
  },
};

export const resolvers: Resolvers = {
  Query,
  Municipality,
  Provider,
  Observation,
  // Canton,
  Cube,
};
