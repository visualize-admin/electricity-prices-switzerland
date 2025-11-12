import namespace from "@rdfjs/namespace";
import { SELECT } from "@tpluscode/sparql-builder";
import { rollup } from "d3";
import { Cube, LookupSource, Source, View } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Literal, NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { ElectricityCategory } from "src/domain/data";
import serverEnv from "src/env/server";
import { PriceComponent } from "src/graphql/queries";
import { OperatorDocumentCategory } from "src/graphql/resolver-types";
import assert from "src/lib/assert";
import { Observation, parseObservation } from "src/lib/observations";
import { makeClientVerbose } from "src/rdf/client-helpers";
import {
  COVERAGE_RATIO_THRESHOLD,
  CoverageCacheManager,
} from "src/rdf/coverage-ratio";
import * as ns from "src/rdf/namespace";

import { createSparqlClientForCube } from "./sparql-client";

type Filters = { [key: string]: string[] | null | undefined } | null;

const ELECTRICITY_PRICE_CUBE =
  "https://energy.ld.admin.ch/elcom/electricityprice";
const ELECTRICIY_PRICE_CANTON_CUBE =
  "https://energy.ld.admin.ch/elcom/electricityprice-canton";
const ELECTRICITY_PRICE_SWISS_CUBE =
  "https://energy.ld.admin.ch/elcom/electricityprice-swiss";

const graphDbHosts = ["https://lindas.int.cz-aws.net"];

const replacements = [
  {
    // The following works on Stardog but not on GraphDB
    // Unfortunately, we cannot yet express DATATYPE(?dimension) through the cube-view-query API.
    // @tomaspluskiewicz will have a look at this.
    // See https://zulip.zazuko.com/#narrow/channel/32-bar-ld-ext/topic/datatype.20filter.20on.20dimension/near/511315
    search: /\(\?([a-zA-Z0-9_]+) != ""\^\^<https:\/\/cube\.link\/Undefined>\)/g,
    replace: "DATATYPE(?$1) != <https://cube.link/Undefined>",
  },
];
const handleQueryForGraphDb = (query: string) => {
  return replacements.reduce((q, r) => q.replace(r.search, r.replace), query);
};

const patchClientForGraphDb = (client: ParsingClient) => {
  const originalQuery = client.query;
  client.query = {
    ...originalQuery,
    select: async (query: string) => {
      return originalQuery.select(handleQueryForGraphDb(query));
    },
    construct: async (query: string) => {
      return originalQuery.construct(handleQueryForGraphDb(query));
    },
    ask: async (query: string) => {
      return originalQuery.ask(handleQueryForGraphDb(query));
    },
    update: async (query: string) => {
      return originalQuery.update(handleQueryForGraphDb(query));
    },
  };
  return client;
};

const createSource = (
  cubeIri: string | undefined,
  client: ParsingClient,
  { verbose = false }: { verbose?: boolean }
) => {
  const cubeClient = cubeIri
    ? createSparqlClientForCube(client.query.endpoint.endpointUrl, cubeIri)
    : client;

  const isGraphDb = graphDbHosts.some((host) =>
    cubeClient.query.endpoint.endpointUrl.includes(host)
  );
  if (verbose) {
    makeClientVerbose(cubeClient);
  }

  if (isGraphDb) {
    patchClientForGraphDb(cubeClient);
  }

  return new Source({
    queryOperation: "postDirect",
    endpointUrl: cubeClient.query.endpoint.endpointUrl,
    client: cubeClient,
  });
};

const priceComponents = Object.values(PriceComponent);

const shouldDimensionFilterUndefined = (dimension: string) => {
  return priceComponents.includes(dimension as PriceComponent);
};

const getCube = async ({
  iri,
  client,
}: {
  iri: string;
  client: ParsingClient;
}): Promise<Cube | null> => {
  const source = createSource(iri, client, { verbose: false });
  const cube = await source.cube(iri);

  if (!cube) {
    return null;
  }

  return cube;
};

const getCubeAndCheck = async (
  iri: string,
  client: ParsingClient
): Promise<Cube> => {
  const cube = await getCube({ iri, client });
  if (!cube) {
    throw Error(`Cube ${iri} not found`);
  }
  if (cube.dimensions.length === 0) {
    throw Error(`Cube ${iri} has no dimensions`);
  }
  return cube;
};

export const getElectricityPriceCube = (client: ParsingClient) =>
  getCubeAndCheck(ELECTRICITY_PRICE_CUBE, client);
export const getElectricityPriceCantonCube = (client: ParsingClient) =>
  getCubeAndCheck(ELECTRICIY_PRICE_CANTON_CUBE, client);
export const getElectricityPriceSwissCube = (client: ParsingClient) =>
  getCubeAndCheck(ELECTRICITY_PRICE_SWISS_CUBE, client);

export const getView = (cube: Cube): View => View.fromCube(cube);

const cubeUndefined = namespace("https://cube.link/")("Undefined");
const undefinedLiteral = rdf.literal("", cubeUndefined);

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
    cubeDimension: ns.electricityPriceDimension("municipality"),
  });

  const regionDimension = view.createDimension({
    source: lookupSource,
    path: ns.schema("containedInPlace"),
    join: muniDimension,
    as: ns.electricityPriceDimension("region"),
  });

  const regionLabelDimension = view.createDimension({
    source: lookupSource,
    path: ns.schema.name,
    join: regionDimension,
    as: ns.electricityPriceDimension("regionLabel"),
  });

  const regionTypeDimension = view.createDimension({
    source: lookupSource,
    path: ns.rdf.type,
    join: regionDimension,
    as: ns.electricityPriceDimension("regionType"),
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

const cache = new LRUCache<string, Observation[]>({
  entryExpirationTimeInMS: 60 * 1000,
});

export const getElectricityPriceObservations = async (
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
  const queryFilters = filters
    ? Object.entries(filters).flatMap(([dimensionKey, filterValues]) =>
        filterValues
          ? buildDimensionFilter(view, dimensionKey, filterValues) ?? []
          : []
      )
    : [];

  const lookupSource = LookupSource.fromSource(source);

  const regionDimensionsAndFilter =
    !isCantons && dimensions?.some((d) => d.match(/^canton/))
      ? getRegionDimensionsAndFilter({ view, lookupSource, locale })
      : undefined;

  const dimensionsWithUndefinedToFilter =
    dimensions?.filter(shouldDimensionFilterUndefined) ?? [];

  const filterViewDimensions = dimensions
    ? dimensions.flatMap((d) => {
        const labelMatches =
          !isCantons && d === "cantonLabel" ? null : d.match(/^(.+)Label$/);

        if (labelMatches) {
          const dimensionKey = labelMatches ? labelMatches[1] : d;
          const dimension = view.dimension({
            cubeDimension: ns.electricityPriceDimension(dimensionKey),
          });

          const labelDimension = view.createDimension({
            source: lookupSource,
            path: ns.schema.name,
            join: dimension,
            as: ns.electricityPriceDimension(`${dimensionKey}Label`),
          });

          // FIXME: we only add the language filter on region labels because we can't use it on strings without language tag (yet?!)
          if (dimension) {
            const labelLangFilter = labelDimension.filter.lang([locale, ""]);

            queryFilters.push(labelLangFilter);
          }

          return dimension ? [dimension, labelDimension] : [];
        }

        const idMatches = d.match(/^(.+)Identifier$/);
        if (idMatches) {
          const dimensionKey = idMatches ? idMatches[1] : d;
          const dimension = view.dimension({
            cubeDimension: ns.electricityPriceDimension(dimensionKey),
          });

          const idDimension = view.createDimension({
            source: lookupSource,
            path: ns.schema.identifier,
            join: dimension,
            as: ns.electricityPriceDimension(`${dimensionKey}Identifier`),
          });

          return dimension ? [dimension, idDimension] : [];
        }

        const dimension = view.dimension({
          cubeDimension: ns.electricityPriceDimension(d),
        });

        if (
          dimension &&
          dimensionsWithUndefinedToFilter.length === 1 &&
          dimensionsWithUndefinedToFilter[0] === d
        ) {
          // If we are only querying 1 dimension that can contain undefined, we can
          // filter out rows with undefined values on this particular column
          queryFilters.push(dimension.filter.ne(undefinedLiteral));
        }

        if (!dimension) {
          console.warn(`No dimension found for ${d}`);
        }

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

  const cacheKey = filterView.observationsQuery().query.toString();

  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

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

  const res = observations.map(parseObservation);

  if (res.length > 0) {
    cache.set(cacheKey, res);
  }

  return res;
};

export const getDimensionValuesAndLabels = async ({
  cube,
  dimensionKey,
  filters,
}: {
  cube: Cube;
  dimensionKey: string;
  filters?: Filters;
}): Promise<{ id: string; name: string; view: View; source: Source }[]> => {
  const view = getView(cube);
  const source = cube.source;
  const lookup = LookupSource.fromSource(source);

  const queryFilters = filters
    ? Object.entries(filters).flatMap(([dim, filterValues]) =>
        filterValues ? buildDimensionFilter(view, dim, filterValues) ?? [] : []
      )
    : [];

  const lookupView = new View({ parent: source, filters: queryFilters });

  const dimension = view.dimension({
    cubeDimension: ns.electricityPriceDimension(dimensionKey),
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
    as: ns.electricityPriceDimension(`${dimensionKey}Label`),
  });
  lookupView.addDimension(dimension).addDimension(labelDimension);

  const observations = await lookupView.observations();

  lookupView.clear();
  lookup.clear();

  return observations.flatMap((obs) => {
    // Filter out "empty" observations
    return obs[ns.electricityPriceDimension(dimensionKey).value]
      ? [
          {
            id: ns.stripNamespaceFromIri({
              iri: obs[ns.electricityPriceDimension(dimensionKey).value]
                .value as string,
            }),
            name: obs[
              ns.electricityPriceDimension(`${dimensionKey}Label`).value
            ].value as string,
            view,
            source,
          },
        ]
      : [];
  });
};

const buildDimensionFilter = (
  view: View,
  dimensionKey: string,
  filters: string[]
) => {
  const viewDimension = view.dimension({
    cubeDimension: ns.electricityPriceDimension(dimensionKey),
  });

  const cubeDimension = viewDimension?.cubeDimensions[0];

  if (!(viewDimension && cubeDimension)) {
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
                ns.addNamespaceToID({ id: filters[0], dimension: dimensionKey })
              )
        )
      : viewDimension.filter.in(
          filters.map((f) => {
            return datatype
              ? rdf.literal(f, datatype)
              : rdf.namedNode(
                  ns.addNamespaceToID({ id: f, dimension: dimensionKey })
                );
          })
        );

  return dimensionFilter;
};

export const getMunicipality = async ({
  id,
  client,
}: {
  id: string;
  client: ParsingClient;
}): Promise<{ id: string; name: string } | null> => {
  const iri = ns.addNamespaceToID({
    dimension: "municipality",
    id,
  });

  const sparql = `
SELECT DISTINCT ?name {
  <${iri}> <http://schema.org/name> ?name .
}
  `;

  const result = (await client.query.select(sparql))[0] as {
    name: Literal;
  };

  return result ? { id, name: result.name.value } : null;
};

export const getCanton = async ({
  id,
  client,
  locale,
}: {
  id: string;
  client: ParsingClient;
  locale: string;
}): Promise<{ id: string; name: string } | null> => {
  const iri = ns.addNamespaceToID({
    dimension: "canton",
    id,
  });

  const sparql = `
SELECT DISTINCT ?name {
  <${iri}> <http://schema.org/name> ?name.
  FILTER (LANGMATCHES(LANG(?name), "${locale}"))
}
  `;

  const result = (await client.query.select(sparql))[0] as {
    name: Literal;
  };
  return result ? { id, name: result.name.value } : null;
};

export const getOperator = async ({
  id,
  client,
}: {
  id: string;
  client: ParsingClient;
}): Promise<{ id: string; name: string } | null> => {
  const iri = ns.addNamespaceToID({
    dimension: "operator",
    id,
  });

  const sparql = `
SELECT DISTINCT ?name {
  <${iri}> <http://schema.org/name> ?name.
}
  `;

  const result = (await client.query.select(sparql))[0] as {
    name: Literal;
  };

  return result ? { id, name: result.name.value } : null;
};

export const getOperatorDocuments = async ({
  operatorId,
  client,
}: {
  operatorId: string;
  client: ParsingClient;
}) => {
  const operatorIri = ns.addNamespaceToID({
    dimension: "operator",
    id: operatorId,
  });

  const query = SELECT.DISTINCT`?download ?name ?url ?year ?category`.FROM(
    rdf.namedNode("https://lindas.admin.ch/elcom/electricityprice")
  ).WHERE`?download a ${ns.schema.CreativeWork} ;
  ${ns.schema.name} ?name ;
  ${ns.schema.url} ?url ;
  ${ns.schema.temporalCoverage} ?year ;
  ${ns.schema.category} ?category ;
  ${ns.schema.creator} ${rdf.namedNode(operatorIri)} .`.build();

  const results = (await client.query.select(query)) as {
    name: Literal;
    url: Literal;
    year: Literal;
    category: NamedNode;
    download: NamedNode;
  }[];

  return results.map((d) => {
    const id = d.download.value;
    const year = d.year.value;
    const category = ns.electricityPrice`documenttype/tariffs_provider`.equals(
      d.category
    )
      ? OperatorDocumentCategory.Tariffs
      : ns.electricityPrice`documenttype/annual_report`.equals(d.category)
      ? OperatorDocumentCategory.AnnualReport
      : ns.electricityPrice`documenttype/financial_statement`.equals(d.category)
      ? OperatorDocumentCategory.FinancialStatement
      : null;
    const name = d.name.value;
    const url = d.url.value;

    if (category === null) {
      console.warn(
        `WARNING: No category match for operator document type <${d.category.value}>`
      );
    }

    return {
      id,
      name,
      category,
      year,
      url,
    };
  });
};

export const getOperatorsMunicipalities = async (
  year: string,
  category: ElectricityCategory | "all",
  client: ParsingClient
) => {
  const query = `
  SELECT DISTINCT ?period ?operator ?municipality ?canton WHERE {
    <https://energy.ld.admin.ch/elcom/electricityprice> <https://cube.link/observationSet> ?observationSet0 .
    ?observationSet0 <https://cube.link/observation> ?source0 .
    ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/period> "${year}"^^<http://www.w3.org/2001/XMLSchema#gYear> .
    ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator> ?operator .
    ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality> ?municipality .
    ${
      category
        ? `?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/category> <https://energy.ld.admin.ch/elcom/electricityprice/category/${category}> .`
        : ""
    }
    ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality> ?municipality .
    ?municipality <http://schema.org/containedInPlace> ?canton .
    ?canton <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.ld.admin.ch/Canton> .
  }
  GROUP BY ?period ?operator ?dimension3 ?municipality ?canton
  `;
  const result = await client.query.select(query);
  const parsed = result.map((res) => {
    const municipalityIri = res.municipality.value;
    const cantonIri = res.canton.value;
    const operatorIri = res.operator.value;
    const municipality = parseInt(
      municipalityIri.replace("https://ld.admin.ch/municipality/", ""),
      10
    );
    const canton = cantonIri.replace("https://ld.admin.ch/canton/", "");
    const operator = operatorIri.replace(
      "https://energy.ld.admin.ch/elcom/electricityprice/operator/",
      ""
    );

    return {
      municipality,
      canton,
      operator,
    };
  });
  return parsed;
};

/**
 * Get the list of operators for a given municipality id, optionally filtered by years.
 * The list is built by combining two queries:
 * 1. Querying offers with a coverage ratio above a certain threshold (default: 0.25)
 * 2. Querying observations in the electricity price cube
 * The results of both queries are combined and deduplicated.
 * For years <= 2025, we need to query the observations as the coverage ratio is not available.
 *
 * @param client - The SPARQL client to use for the queries.
 * @param municipalityId - The municipality id to get the operators for.
 * @param years - Optional list of years to filter the operators by, if not passed, all years are considered.
 * @param coverageRatioThreshold - The minimum coverage ratio for offers to be considered (default: 0.25).
 * @returns A list of operators with their id, name, and the years they cover in the given municipality.
 */
export const getMunicipalityOperators = async (
  client: ParsingClient,
  municipalityId: string,
  years: string[] | null
) => {
  const queryViaObservations = `
# from file queries/tariff.rq
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX cube: <https://cube.link/>
PREFIX strom: <https://energy.ld.admin.ch/elcom/electricityprice/dimension/>

SELECT ?obs ?year ?municipality ?operator ?operatorName ?year
FROM <https://lindas.admin.ch/elcom/electricityprice>
WHERE {
  <https://energy.ld.admin.ch/elcom/electricityprice> a cube:Cube ;
    cube:observationSet/cube:observation ?obs .
  
  VALUES ?municipality { <https://ld.admin.ch/municipality/${municipalityId}> }
  ${
    years
      ? `VALUES ?year { ${years.map((x) => `"${x}"^^xsd:gYear`).join(" ")} }`
      : ""
  }

  ?obs strom:period ?year ;
    strom:municipality ?municipality;
    strom:operator ?operator.

  ?operator schema:name ?operatorName .
}
  `;

  const viaObservations = await client.query
    .select(queryViaObservations)
    .then((results) => {
      return results.map((res) => ({
        id: ns.stripNamespaceFromIri({ iri: res.operator.value }),
        name: res.operatorName.value,
        year: res.year.value,
        obs: res.obs.value,
        municipality: ns.stripNamespaceFromIri({
          iri: res.municipality.value,
        }),
      }));
    })
    .catch((e) => {
      console.error("Error executing observations query:", e);
      return [];
    });

  const coverageManager = new CoverageCacheManager(client);
  await coverageManager.prepare(years ?? []);

  const viaObservationsFiltered = viaObservations.filter((obs) => {
    const coverageRatio = coverageManager.getCoverage(
      {
        municipality: obs.municipality,
        operator: obs.id,
        period: obs.year,
      },
      "NE7"
    );

    return coverageRatio > COVERAGE_RATIO_THRESHOLD;
  });

  // transform into id, name, years: []
  const unique = Array.from(
    rollup(
      viaObservationsFiltered,
      (v) => ({
        id: v[0].id,
        name: v[0].name,
        years: Array.from(new Set(v.map((d) => d.year))).sort(),
      }),
      (d) => d.id
    ).values()
  );

  return unique.sort((a, b) => a.name.localeCompare(b.name));
};

export type OperatorMunicipalityRecord = Awaited<
  ReturnType<typeof getOperatorsMunicipalities>
>[number];

export const getOperatorMunicipalities = async (
  id: string,
  locale: string,
  client: ParsingClient
) => {
  const cube = await getElectricityPriceCube(client);

  const municipalities = await getDimensionValuesAndLabels({
    cube,
    dimensionKey: "municipality",
    filters: { operator: [id] },
  });

  return municipalities
    .sort((a, b) => a.name.localeCompare(b.name, locale))
    .map(({ id, name }) => ({ id, name }));
};

/** @knipignore */
export const getSparqlEditorUrl = (query: string): string | null => {
  assert(!!serverEnv, "serverEnv is not defined");
  return serverEnv.SPARQL_EDITOR
    ? `${serverEnv.SPARQL_EDITOR}#query=${encodeURIComponent(query)}`
    : query;
};
