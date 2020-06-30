import rdf from "rdf-ext";
import { parseObservationValue } from "../lib/observations";
import { getCubeDimension, getName, getObservations, getSource } from "./rdf";
import {
  CantonResolvers,
  CubeResolvers,
  MunicipalityResolvers,
  Observation,
  ProviderResolvers,
  QueryResolvers,
  Resolvers,
} from "./resolver-types";

const MOCK_DATA = {
  municipalities: {
    "1": { id: "1", name: "A", canton: "1", providers: ["1", "2"] },
    "2": { id: "2", name: "B", canton: "1", providers: ["2"] },
  },
  cantons: {
    "1": { id: "1", name: "Canton 1" },
    "2": { id: "2", name: "Canton 2" },
  },
  providers: {
    "1": { id: "1", name: "Provider 1" },
    "2": { id: "2", name: "Provider 2" },
  },
};

const Query: QueryResolvers = {
  cubes: async (_, { locale }) => {
    const source = getSource();
    const cubes = await source.cubes();
    return cubes.map((cube) => ({ locale, cube }));
  },
  cubeByIri: async (_, { locale, iri }) => {
    const source = getSource();
    const cubes = await source.cubes();
    return { locale, cube: cubes.find((cube) => cube.term?.value === iri) };
  },
  municipalities: async () => [{ id: "1" }, { id: "2" }],
  cantons: async () => [{ id: "1" }, { id: "2" }],
  providers: async () => [{ id: "1" }, { id: "2" }],
  municipality: async (_, { id }) => ({ id }),
  canton: async (_, { id }) => ({ id }),
  provider: async (_, { id }) => ({ id }),
};

const Municipality: MunicipalityResolvers = {
  name: (municipality) => MOCK_DATA.municipalities[municipality.id].name,
  canton: (municipality) => {
    return { id: MOCK_DATA.municipalities[municipality.id].canton };
  },
  providers: (municipality) => {
    return MOCK_DATA.municipalities[municipality.id].providers.map((id) => ({
      id,
    }));
  },
  priceComponents: () => {
    return { total: 100 };
  },
};

const Canton: CantonResolvers = {
  name: (canton) => MOCK_DATA.cantons[canton.id].name,
  municipalities: (canton) => {
    return Object.values(MOCK_DATA.municipalities).filter(
      (m) => m.canton === canton.id
    );
  },
  priceComponents: () => {
    return { total: 85 };
  },
};

const Provider: ProviderResolvers = {
  name: (provider) => MOCK_DATA.providers[provider.id].name,
  municipalities: (provider) => {
    return Object.values(MOCK_DATA.municipalities).filter((m) =>
      m.providers.includes(provider.id)
    );
  },
  priceComponents: () => {
    return { total: 63 };
  },
};

const Cube: CubeResolvers = {
  iri: ({ cube }) => cube.term?.value,
  name: ({ cube, locale }) => {
    return getName(cube, { locale });
  },
  dimensionPeriod: ({ cube, locale }) => {
    return getCubeDimension(cube, "period", { locale });
  },
  observations: async ({ cube, locale }, { period }) => {
    const periodDim = getCubeDimension(cube, "period", { locale });
    const categoryDim = getCubeDimension(cube, "category", { locale });

    const periodFilter = periodDim.dimension.filter.eq(
      rdf.literal(period, periodDim.datatype)
    );
    const categoryFilter = categoryDim.dimension.filter.eq(
      rdf.namedNode(
        "https://energy.ld.admin.ch/elcom/energy-pricing/category/H4"
      )
    );

    const filters = [periodFilter, categoryFilter];

    const rawObservations = await getObservations(cube, { filters });

    return rawObservations.map((d) => {
      let parsed: Partial<Observation> = {};
      for (const [k, v] of Object.entries(d)) {
        parsed[
          k.replace(
            "https://energy.ld.admin.ch/elcom/energy-pricing/dimension/",
            ""
          )
        ] = parseObservationValue(v as $FixMe);
      }
      return parsed;
    });
  },
};

export const resolvers: Resolvers = {
  Query,
  Municipality,
  Provider,
  Canton,
  Cube,
};
