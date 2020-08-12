import namespace from "@rdfjs/namespace";
import {
  Cube,
  CubeDimension,
  LookupSource,
  Source,
  View,
} from "@zazuko/rdf-cube-view-query";
import rdf from "rdf-ext";
import { Literal, NamedNode } from "rdf-js";
import { defaultLocale } from "../locales/locales";

type Filters = { [key: string]: string[] | null | undefined } | null;

const ns = {
  dc: namespace("http://purl.org/dc/elements/1.1/"),
  energyPricing: namespace(
    "https://energy.ld.admin.ch/elcom/energy-pricing/dimension/"
  ),
  energyPricingValue: namespace(
    "https://energy.ld.admin.ch/elcom/energy-pricing/"
  ),
  rdf: namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  schema: namespace("http://schema.org/"),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
  classifications: namespace("http://classifications.data.admin.ch/"),
  gont: namespace("https://gont.ch/"),
  municipality: namespace(
    "https://register.ld.admin.ch/fso/agvch/municipality/"
  ),
};

export const getSource = () =>
  new Source({
    endpointUrl:
      process.env.SPARQL_ENDPOINT ?? "https://test.lindas.admin.ch/query",
    // user: '',
    // password: ''
  });

export const getName = (
  node: Cube | CubeDimension,
  { locale }: { locale: string }
) => {
  const term =
    node
      .out(ns.schema`name`)
      .terms.find(
        (term) => term.termType === "Literal" && term.language === locale
      ) ??
    node
      .out(ns.schema`name`)
      .terms.find(
        (term) => term.termType === "Literal" && term.language === defaultLocale
      ); // FIXME: fall back to all languages in order

  return term?.value ?? "---";
};

export const getView = (cube: Cube): View => View.fromCube(cube);

export const getObservations = async (
  { view, source }: { view: View; source: Source },
  {
    filters,
    dimensions,
  }: {
    filters?: Filters;
    dimensions?: string[];
  }
) => {
  const queryFilters = filters
    ? Object.entries(filters).flatMap(([dimensionKey, filterValues]) =>
        filterValues
          ? buildDimensionFilter(view, dimensionKey, filterValues)
          : []
      )
    : [];

  const lookupSource = LookupSource.fromSource(source);

  const filterView = new View({
    dimensions: dimensions
      ? dimensions.flatMap((d) => {
          const matches = d.match(/^(.+)Label$/);
          const dimensionKey = matches ? matches[1] : d;

          // FIXME: remove provider dimension check!
          if (matches) {
            const dimension = view.dimension({
              cubeDimension: ns.energyPricing(dimensionKey),
            });

            console.log(dimensionKey);

            const labelDimension = view.createDimension({
              source: lookupSource,
              path:
                dimensionKey === "region" ? ns.gont.longName : ns.schema.name,
              join: dimension,
              as: ns.energyPricing(`${dimensionKey}Label`),
            });

            return dimension ? [dimension, labelDimension] : [];
          }

          const dimension = view.dimension({
            cubeDimension: ns.energyPricing(d),
          });
          return dimension ? [dimension] : [];
        })
      : view.dimensions,
    filters: queryFilters,
  });

  console.log(filterView.observationsQuery().query.toString());

  const observations = await filterView.observations();

  // Clean up
  filterView.clear();
  lookupSource.clear();

  // Workaround for faulty empty query result
  if (
    observations.length === 1 &&
    Object.values(observations[0]).some((v) => v === undefined)
  ) {
    return [];
  }

  return observations;
};

export const getCantonObservations = async (
  { view, source }: { view: View; source: Source },
  {
    filters,
    dimensions,
  }: {
    filters?: Filters;
    dimensions?: string[];
  }
) => {
  const queryFilters = filters
    ? Object.entries(filters).flatMap(([dimensionKey, filterValues]) =>
        filterValues
          ? buildDimensionFilter(view, dimensionKey, filterValues)
          : []
      )
    : [];

  const lookupSource = LookupSource.fromSource(source);

  const filterView = new View({
    dimensions: dimensions
      ? dimensions.flatMap((d) => {
          const matches = d.match(/^(.+)Label$/);
          const dimensionKey = matches ? matches[1] : d;

          // FIXME: remove provider dimension check!
          if (matches) {
            const dimension = view.dimension({
              cubeDimension: ns.energyPricing(dimensionKey),
            });

            const labelDimension = view.createDimension({
              source: lookupSource,
              path: ns.schema.name,
              join: dimension,
              as: ns.energyPricing(`${dimensionKey}Label`),
            });

            return dimension ? [dimension, labelDimension] : [];
          }

          const dimension = view.dimension({
            cubeDimension: ns.energyPricing(d),
          });
          return dimension ? [dimension] : [];
        })
      : view.dimensions,
    filters: queryFilters,
  });

  console.log(filterView.observationsQuery().query.toString());

  const observations = await filterView.observations();

  // Clean up
  filterView.clear();
  lookupSource.clear();

  // Workaround for faulty empty query result
  if (
    observations.length === 1 &&
    Object.values(observations[0]).some((v) => v === undefined)
  ) {
    return [];
  }

  return observations;
};

export const getDimensionValuesAndLabels = async ({
  view,
  source,
  dimensionKey,
  filters,
}: {
  view: View;
  source: Source;
  dimensionKey: string;
  filters?: Filters;
}): Promise<{ id: string; name: string; view: View; source: Source }[]> => {
  const lookup = LookupSource.fromSource(source);

  const queryFilters = filters
    ? Object.entries(filters).flatMap(([dim, filterValues]) =>
        filterValues ? buildDimensionFilter(view, dim, filterValues) : []
      )
    : [];

  const lookupView = new View({ parent: source, filters: queryFilters });

  const dimension = view.dimension({
    cubeDimension: ns.energyPricing(dimensionKey),
  });

  if (!dimension) {
    throw Error(
      `getDimensionValuesAndLabels: No dimension for '${dimensionKey}'`
    );
  }

  const labelDimension = lookupView.createDimension({
    source: lookup,
    path: ns.schema.name,
    join: dimension,
    as: ns.energyPricing(`${dimensionKey}Label`),
  });
  lookupView.addDimension(dimension).addDimension(labelDimension);

  console.log(lookupView.observationsQuery().query.toString());

  const observations = await lookupView.observations();

  lookupView.clear();
  lookup.clear();

  return observations.flatMap((obs) => {
    // Filter out "empty" observations
    return obs[ns.energyPricing(dimensionKey).value]
      ? [
          {
            id: stripNamespaceFromIri({
              dimension: dimensionKey,
              iri: obs[ns.energyPricing(dimensionKey).value].value as string,
            }),
            name: obs[ns.energyPricing(`${dimensionKey}Label`).value]
              .value as string,
            view,
            source,
          },
        ]
      : [];
  });
};

export const getCubeDimension = (
  view: View,
  dimensionKey: string,
  { locale }: { locale: string }
) => {
  const viewDimension = view.dimension({
    cubeDimension: ns.energyPricing(dimensionKey),
  });

  const cubeDimension = viewDimension?.cubeDimensions[0];

  if (!cubeDimension) {
    throw Error(`getCubeDimension: No dimension for '${dimensionKey}'`);
  }

  const iri = cubeDimension.path.value;
  const min = cubeDimension.minInclusive?.value;
  const max = cubeDimension.maxInclusive?.value;
  const name = getName(cubeDimension, { locale });

  return {
    iri,
    name,
    min,
    max,
    datatype: cubeDimension.datatype,
    dimension: viewDimension,
  };
};

export const buildDimensionFilter = (
  view: View,
  dimensionKey: string,
  filters: string[]
) => {
  const viewDimension = view.dimension({
    cubeDimension: ns.energyPricing(dimensionKey),
  });

  const cubeDimension = viewDimension?.cubeDimensions[0];

  if (!viewDimension || !cubeDimension) {
    throw Error(`buildDimensionFilter: No dimension for '${dimensionKey}'`);
  }

  const { datatype } = cubeDimension;

  const dimensionFilter =
    filters.length === 1
      ? viewDimension.filter.eq(
          datatype
            ? rdf.literal(filters[0], datatype)
            : rdf.namedNode(
                addNamespaceToID({ id: filters[0], dimension: dimensionKey })
              )
        )
      : viewDimension.filter.in(
          filters.map((f) => {
            return datatype
              ? rdf.literal(f, datatype)
              : rdf.namedNode(
                  addNamespaceToID({ id: f, dimension: dimensionKey })
                );
          })
        );

  return dimensionFilter;
};

// regex based search query for municipalities and providers

type SearchType = "municipality" | "provider" | "canton";

export const search = async ({
  view,
  source,
  query,
  ids,
  types = ["municipality", "provider"],
  limit = 10,
}: {
  view: View;
  source: Source;
  query: string;
  ids: string[];
  types?: SearchType[];
  limit?: number;
}) => {
  const sparql = `
  SELECT ?type ?iri ?name {
    {
      SELECT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/fso/agvch> {
          ?municipality a <https://schema.ld.admin.ch/Municipality> .
          ?municipality <http://schema.org/name> ?municipalityLabel.    
        }
        FILTER (regex(?municipalityLabel, ".*${
          query || "-------"
        }.*", "i") || ?municipality IN (${ids
    .map((id) => `<${addNamespaceToID({ dimension: "municipality", id })}>`)
    .join(",")}))
      }
    } UNION {
      SELECT ("provider" AS ?type) (?provider AS ?iri) (?providerLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
          ?provider a <http://schema.org/Organization> .
          ?provider <http://schema.org/name> ?providerLabel.    
        }
        FILTER (regex(?providerLabel, ".*${
          query || "-------"
        }.*", "i") || ?provider IN (${ids
    .map((id) => `<${addNamespaceToID({ dimension: "provider", id })}>`)
    .join(",")}))
      }
    } UNION {
      SELECT ("canton" AS ?type) (?canton AS ?iri) (?cantonLabel AS ?name) WHERE {
        GRAPH <https://linked.opendata.swiss/graph/eCH-0071> {
          ?canton a <https://gont.ch/Canton> .
          ?canton <https://gont.ch/longName> ?cantonLabel.    
        }
        FILTER (regex(?cantonLabel, ".*${
          query || "-------"
        }.*", "i") || ?canton IN (${ids
    .map((id) => `<${addNamespaceToID({ dimension: "canton", id })}>`)
    .join(",")}))
      }
    }
    FILTER (?type IN (${types.map((t) => JSON.stringify(t)).join(",")}))
  }
  LIMIT ${limit + ids.length}
  `;

  // and also provides a SPARQL client
  const client = (source as $FixMe).client;

  console.log(sparql);

  const results: {
    type: Literal;
    iri: NamedNode;
    name: Literal;
  }[] = await client.query.select(sparql);

  return results.map((d) => {
    const iri = d.iri.value;
    const type = d.type.value;
    const name = d.name.value;

    return {
      id: stripNamespaceFromIri({ dimension: type, iri }),
      name,
      type,
      view,
      source,
    };
  });
};

/**
 * Strips the namespace from an IRI to get shorter IDs
 *
 * E.g. "http://classifications.data.admin.ch/municipality/123" -> "123"
 * E.g. "https://energy.ld.admin.ch/elcom/energy-pricing/category/H1" -> "H1"
 */
export const stripNamespaceFromIri = ({
  dimension,
  iri,
}: {
  dimension: string;
  iri: string;
}): string => {
  const matches = iri.match(/\/([a-zA-Z0-9]+)$/);

  if (!matches) {
    // Warn?
    return iri;
  }

  return matches[1];
};

/**
 * Adds the namespace to an ID to get the full IRI
 *
 * E.g. "municipality" "123" -> "http://classifications.data.admin.ch/municipality/123"
 * E.g. "category" "H1" -> "https://energy.ld.admin.ch/elcom/energy-pricing/category/H1"
 */
export const addNamespaceToID = ({
  dimension,
  id,
}: {
  dimension: string;
  id: string;
}): string => {
  // Check for full IRIs
  if (id.match(/^http(s)?:\/\//)) {
    return id;
  }
  if (dimension === "municipality") {
    return ns.municipality(`${id}`).value;
  }
  if (dimension === "canton") {
    return ns.classifications(`canton/${id}`).value;
  }
  return ns.energyPricingValue(`${dimension}/${id}`).value;
};
