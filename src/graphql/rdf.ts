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
    "https://energy.ld.admin.ch/elcom/electricity-price/dimension/"
  ),
  energyPricingValue: namespace(
    "https://energy.ld.admin.ch/elcom/electricity-price/"
  ),
  rdf: namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  schema: namespace("http://schema.org/"),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
  classifications: namespace("http://classifications.data.admin.ch/"),
  schemaAdmin: namespace("https://schema.ld.admin.ch/"),
  municipality: namespace("https://register.ld.admin.ch/municipality/"),
  canton: namespace("https://register.ld.admin.ch/canton/"),
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

const getRegionDimensionsAndFilter = ({
  view,
  lookupSource,
  locale,
}: {
  view: View;
  lookupSource: LookupSource;
  locale: string;
}) => {
  const muniDimension = view.dimension({
    cubeDimension: ns.energyPricing("municipality"),
  });

  const regionDimension = view.createDimension({
    source: lookupSource,
    path: ns.schema("containedInPlace"),
    join: muniDimension,
    as: ns.energyPricing("region"),
  });

  const regionLabelDimension = view.createDimension({
    source: lookupSource,
    path: ns.schema.name,
    join: regionDimension,
    as: ns.energyPricing("regionLabel"),
  });

  const regionTypeDimension = view.createDimension({
    source: lookupSource,
    path: ns.rdf.type,
    join: regionDimension,
    as: ns.energyPricing("regionType"),
  });

  const regionTypeFilter = regionTypeDimension.filter.eq(
    rdf.namedNode(ns.schemaAdmin("Canton").value)
  );

  const labelLangFilter = regionLabelDimension.filter.lang([locale, ""]);

  return muniDimension
    ? {
        dimensions: [
          muniDimension,
          regionDimension,
          regionLabelDimension,
          regionTypeDimension,
        ],
        filters: [regionTypeFilter, labelLangFilter],
      }
    : undefined;
};

export const getObservations = async (
  {
    view,
    source,
    isCantons,
    locale,
  }: { view: View; source: Source; isCantons?: boolean; locale: string },
  {
    filters,
    dimensions,
  }: {
    filters?: Filters;
    dimensions?: string[];
  }
) => {
  console.log(dimensions);
  const queryFilters = filters
    ? Object.entries(filters).flatMap(([dimensionKey, filterValues]) =>
        filterValues
          ? buildDimensionFilter(
              view,
              dimensionKey.replace(/^canton/, "region"),
              filterValues
            ) ?? []
          : []
      )
    : [];

  const lookupSource = LookupSource.fromSource(source);

  const regionDimensionsAndFilter =
    !isCantons && dimensions?.some((d) => d.match(/^region/))
      ? getRegionDimensionsAndFilter({ view, lookupSource, locale })
      : undefined;

  const filterViewDimensions = dimensions
    ? dimensions.flatMap((d) => {
        const labelMatches =
          !isCantons && d === "regionLabel" ? null : d.match(/^(.+)Label$/);
        const dimensionKey = labelMatches ? labelMatches[1] : d;

        if (labelMatches) {
          const dimension = view.dimension({
            cubeDimension: ns.energyPricing(dimensionKey),
          });

          const labelDimension = view.createDimension({
            source: lookupSource,
            path: ns.schema.name,
            join: dimension,
            as: ns.energyPricing(`${dimensionKey}Label`),
          });

          // FIXME: we only add the language filter on region labels because we can't use it on strings without language tag (yet?!)
          if (dimension) {
            const labelLangFilter = labelDimension.filter.lang([locale, ""]);

            queryFilters.push(labelLangFilter);
          }

          return dimension ? [dimension, labelDimension] : [];
        }

        const dimension = view.dimension({
          cubeDimension: ns.energyPricing(d),
        });
        return dimension ? [dimension] : [];
      })
    : view.dimensions;

  const filterView = new View(
    regionDimensionsAndFilter
      ? {
          dimensions: [
            ...filterViewDimensions,
            ...regionDimensionsAndFilter.dimensions,
          ],
          filters: [...queryFilters, ...regionDimensionsAndFilter.filters],
        }
      : {
          dimensions: filterViewDimensions,
          filters: queryFilters,
        }
  );

  console.log("> getObservations");
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
        filterValues
          ? buildDimensionFilter(
              view,
              dim.replace(/^canton/, "region"),
              filterValues
            ) ?? []
          : []
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
    path: dimensionKey === "region" ? ns.schema.alternateName : ns.schema.name,
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
    console.warn(`buildDimensionFilter: No dimension for '${dimensionKey}'`);
    return;
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

// regex based search query for municipalities and operators

type SearchType = "municipality" | "operator" | "canton";

export const search = async ({
  source,
  query,
  ids,
  locale = defaultLocale,
  types = ["municipality", "operator"],
  limit = 10,
}: {
  source: Source;
  query: string;
  ids: string[];
  locale: string | null | undefined;
  types?: SearchType[];
  limit?: number;
}) => {
  const trimmedQuery = query.trim();

  const sparql = `
  PREFIX schema: <http://schema.org/>
  PREFIX lac: <https://schema.ld.admin.ch/>
  SELECT DISTINCT ?type ?iri ?name {
    {
      SELECT DISTINCT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/fso/agvch> {
          {
            ?municipality a <https://schema.ld.admin.ch/Municipality> .
          } UNION {
            ?municipality a <https://schema.ld.admin.ch/AbolishedMunicipality> .
          }
          ?municipality <http://schema.org/name> ?municipalityLabel.
        }
        FILTER (regex(?municipalityLabel, ".*${
          trimmedQuery || "-------"
        }.*", "i") || ?municipality IN (${ids
    .map((id) => `<${addNamespaceToID({ dimension: "municipality", id })}>`)
    .join(",")}))
      } ORDER BY ?municipalityLabel LIMIT ${limit + ids.length}
    } UNION {
      SELECT DISTINCT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?name)
        WHERE { GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
          ?offer a schema:Offer ;
            schema:areaServed ?municipality;
            schema:postalCode "${trimmedQuery}" .
          }
          { GRAPH <https://lindas.admin.ch/fso/agvch> {
            ?municipality schema:name ?municipalityLabel .
          }}
      } ORDER BY ?municipalityLabel LIMIT ${limit + ids.length}
    } UNION {
      SELECT DISTINCT ("operator" AS ?type) (?operator AS ?iri) (?operatorLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
          ?operator a <http://schema.org/Organization> .
          ?operator <http://schema.org/name> ?operatorLabel.    
        }
        FILTER (regex(?operatorLabel, ".*${
          trimmedQuery || "-------"
        }.*", "i") || ?operator IN (${ids
    .map((id) => `<${addNamespaceToID({ dimension: "operator", id })}>`)
    .join(",")}))
      } ORDER BY ?operatorLabel LIMIT ${limit + ids.length}
    } UNION {
      SELECT DISTINCT ("canton" AS ?type) (?canton AS ?iri) (?cantonLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/fso/agvch> {
          ?canton a <https://schema.ld.admin.ch/Canton> .
          ?canton <http://schema.org/name> ?cantonLabel .    
        }
        FILTER (LANGMATCHES(LANG(?cantonLabel), "${locale}") && (regex(?cantonLabel, ".*${
    trimmedQuery || "-------"
  }.*", "i") || ?canton IN (${ids
    .map((id) => `<${addNamespaceToID({ dimension: "canton", id })}>`)
    .join(",")})))
      } ORDER BY ?cantonLabel LIMIT ${limit + ids.length}
    }
    FILTER (?type IN (${types.map((t) => JSON.stringify(t)).join(",")}))
  }
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
    };
  });
};

export const getOperatorDocuments = async ({
  operatorId,
  source,
}: {
  operatorId: string;
  source: Source;
}) => {
  const operatorIri = addNamespaceToID({
    dimension: "operator",
    id: operatorId,
  });

  const sparql = `
PREFIX schema: <http://schema.org/>
SELECT DISTINCT ?download ?name ?url ?year ?category
FROM <https://lindas.admin.ch/elcom/electricityprice>  {
  ?download a schema:CreativeWork ;
    schema:name ?name ;
    schema:url ?url ;
    schema:temporalCoverage ?year ;
    schema:category ?category ;
    schema:creator <${operatorIri}> .
}
  `;

  const client = (source as $FixMe).client;

  console.log(sparql);

  const results: {
    name: Literal;
    url: Literal;
    year: Literal;
    category: NamedNode;
    download: NamedNode;
  }[] = await client.query.select(sparql);

  return results.map((d) => {
    const id = d.download.value;
    const year = d.year.value;
    const category = d.category.value;
    const name = d.name.value;
    const url = d.url.value;

    return {
      id,
      name,
      category,
      year,
      url,
    };
  });
};

/**
 * Strips the namespace from an IRI to get shorter IDs
 *
 * E.g. "http://classifications.data.admin.ch/municipality/123" -> "123"
 * E.g. "https://energy.ld.admin.ch/elcom/electricity-price/category/H1" -> "H1"
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
 * E.g. "category" "H1" -> "https://energy.ld.admin.ch/elcom/electricity-price/category/H1"
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
  if (dimension === "canton" || dimension === "region") {
    return ns.canton(`${id}`).value;
  }
  return ns.energyPricingValue(`${dimension}/${id}`).value;
};
