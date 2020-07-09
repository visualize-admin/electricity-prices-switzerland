import { parseResolveInfo } from "graphql-parse-resolve-info";
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
  Observation,
  ProviderResolvers,
  QueryResolvers,
  Resolvers,
} from "./resolver-types";
import { defaultLocale } from "../locales/locales";
import { GraphQLResolveInfo } from "graphql";
import { SinglePriceComponentObservation } from "./queries";

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
    if (fieldMap) {
      return Object.keys(fieldMap);
    }
  }

  return undefined;
};

const Cube: CubeResolvers = {
  iri: ({ cube }) => cube.term?.value ?? "???",
  name: ({ cube, locale }) => {
    return getName(cube, { locale });
  },
  dimensionPeriod: ({ view, locale }) => {
    return getCubeDimension(view, "period", { locale });
  },
  observations: async (
    { view, locale },
    { priceComponent, filters },
    ctx,
    info
  ) => {
    // Look ahead to select proper dimensions for query
    // const dimensionKeys = getResolverFields(info, "Observation");

    const dimensionKeys = [
      priceComponent,
      "municipality",
      "provider",
      "category",
      "period",
    ];

    const rawObservations = await getObservations(view, {
      filters,
      dimensions: dimensionKeys,
    });

    const observations = rawObservations.map((d) => {
      let parsed: { [k: string]: string | number | boolean } = {};
      for (const [k, v] of Object.entries(d)) {
        const key = k.replace(
          "https://energy.ld.admin.ch/elcom/energy-pricing/dimension/",
          ""
        );

        parsed[key === priceComponent ? "value" : key] = parseObservationValue(
          v
        );
      }
      return parsed;
    });

    // Should we type-check with io-ts here? Probably not necessary because the GraphQL API will also type-check against the schema.
    return observations as SinglePriceComponentObservation[];
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
  // Canton,
  Cube,
};
