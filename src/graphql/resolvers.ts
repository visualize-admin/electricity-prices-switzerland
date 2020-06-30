import { Source } from "@zazuko/rdf-cube-view-query";
import namespace from "@rdfjs/namespace";

import {
  QueryResolvers,
  Resolvers,
  CubeResolvers,
  PriceComponentsResolvers,
  MunicipalityResolvers,
  CantonResolvers,
  ProviderResolvers,
} from "./resolver-types";

const ns = {
  dc: namespace("http://purl.org/dc/elements/1.1/"),
  energyPricing: namespace(
    "https://energy.ld.admin.ch/elcom/energy-pricing/dimension/"
  ),
  rdf: namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  schema: namespace("http://schema.org/"),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
};

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
    const source = new Source({
      endpointUrl: "https://test.lindas.admin.ch/query",
      sourceGraph: "https://lindas.admin.ch/elcom/electricityprice",
      // user: '',
      // password: ''
    });

    const cubes = await source.cubes();

    return cubes.map((cube) => ({ locale, cube }));
  },
  cubeByIri: async (_, { locale, iri }) => {
    const source = new Source({
      endpointUrl: "https://test.lindas.admin.ch/query",
      sourceGraph: "https://lindas.admin.ch/elcom/electricityprice",
      // user: '',
      // password: ''
    });

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
    const term =
      cube.out(ns.schema.name).terms.find((term) => term.language === locale) ??
      cube.out(ns.schema.name).terms.find((term) => term.language === "de");
    return term?.value;
  },
};

export const resolvers: Resolvers = {
  Query,
  Municipality,
  Provider,
  Canton,
  Cube,
};
