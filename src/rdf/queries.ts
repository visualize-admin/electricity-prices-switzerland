import { SELECT } from "@tpluscode/sparql-builder";
import {
  Cube,
  CubeDimension,
  LookupSource,
  Source,
  View,
} from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Literal, NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { OperatorDocumentCategory } from "src/graphql/resolver-types";
import { Observation, parseObservation } from "src/lib/observations";
import { defaultLocale } from "src/locales/locales";

import * as ns from "./namespace";
import { sparqlClient } from "./sparql-client";

type Filters = { [key: string]: string[] | null | undefined } | null;

export const OBSERVATIONS_CUBE =
  "https://energy.ld.admin.ch/elcom/electricityprice";
export const CANTON_OBSERVATIONS_CUBE =
  "https://energy.ld.admin.ch/elcom/electricityprice-canton";
export const SWISS_OBSERVATIONS_CUBE =
  "https://energy.ld.admin.ch/elcom/electricityprice-swiss";

export const createSource = () =>
  new Source({
    queryOperation: "postDirect",
    endpointUrl:
      process.env.SPARQL_ENDPOINT ?? "https://test.lindas.admin.ch/query",
  });

export const getCube = async ({
  iri,
}: {
  iri: string;
}): Promise<Cube | null> => {
  const source = createSource();
  const cube = await source.cube(iri);

  if (!cube) {
    return null;
  }

  return cube;
};

export const getObservationsCube = async (): Promise<Cube> => {
  const cube = await getCube({ iri: OBSERVATIONS_CUBE });
  if (!cube) {
    throw Error(`Cube ${OBSERVATIONS_CUBE} not found`);
  }
  if (cube.dimensions.length === 0) {
    throw Error(`Cube ${OBSERVATIONS_CUBE} has no dimensions`);
  }
  return cube;
};
export const getCantonMedianCube = async (): Promise<Cube> => {
  const cube = await getCube({ iri: CANTON_OBSERVATIONS_CUBE });
  if (!cube) {
    throw Error(`Cube ${CANTON_OBSERVATIONS_CUBE} not found`);
  }
  if (cube.dimensions.length === 0) {
    throw Error(`Cube ${CANTON_OBSERVATIONS_CUBE} has no dimensions`);
  }
  return cube;
};
export const getSwissMedianCube = async (): Promise<Cube> => {
  const cube = await getCube({ iri: SWISS_OBSERVATIONS_CUBE });
  if (!cube) {
    throw Error(`Cube ${SWISS_OBSERVATIONS_CUBE} not found`);
  }
  if (cube.dimensions.length === 0) {
    throw Error(`Cube ${SWISS_OBSERVATIONS_CUBE} has no dimensions`);
  }
  return cube;
};

// export const getSourceAndCubeViews = async () => {
//   const source = createSource();
//   const [
//     observationsCube,
//     cantonObservationsCube,
//     swissObservationsCube,
//   ] = await Promise.all([
//     getCube({ iri: OBSERVATIONS_CUBE }),
//     getCube({ iri: CANTON_OBSERVATIONS_CUBE }),
//     getCube({ iri: SWISS_OBSERVATIONS_CUBE }),
//   ]);

//   if (!observationsCube) {
//     throw Error(`Cube ${OBSERVATIONS_CUBE} not found`);
//   }
//   if (!cantonObservationsCube) {
//     throw Error(`Cube ${CANTON_OBSERVATIONS_CUBE} not found`);
//   }
//   if (!swissObservationsCube) {
//     throw Error(`Cube ${SWISS_OBSERVATIONS_CUBE} not found`);
//   }

//   return {
//     source,
//     observationsView: getView(observationsCube),
//     cantonObservationsView: getView(cantonObservationsCube),
//     swissObservationsView: getView(swissObservationsCube),
//   };
// };

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
    cubeDimension: ns.electricitypriceDimension("municipality"),
  });

  const regionDimension = view.createDimension({
    source: lookupSource,
    path: ns.schema("containedInPlace"),
    join: muniDimension,
    as: ns.electricitypriceDimension("region"),
  });

  const regionLabelDimension = view.createDimension({
    source: lookupSource,
    path: ns.schema.name,
    join: regionDimension,
    as: ns.electricitypriceDimension("regionLabel"),
  });

  const regionTypeDimension = view.createDimension({
    source: lookupSource,
    path: ns.rdf.type,
    join: regionDimension,
    as: ns.electricitypriceDimension("regionType"),
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
  const queryFilters = filters
    ? Object.entries(filters).flatMap(([dimensionKey, filterValues]) =>
        filterValues
          ? buildDimensionFilter(
              view,
              dimensionKey,
              // dimensionKey.replace(/^canton/, "region"),
              filterValues
            ) ?? []
          : []
      )
    : [];

  const lookupSource = LookupSource.fromSource(source);

  const regionDimensionsAndFilter =
    !isCantons && dimensions?.some((d) => d.match(/^canton/))
      ? getRegionDimensionsAndFilter({ view, lookupSource, locale })
      : undefined;

  const filterViewDimensions = dimensions
    ? dimensions.flatMap((d) => {
        const labelMatches =
          !isCantons && d === "cantonLabel" ? null : d.match(/^(.+)Label$/);

        if (labelMatches) {
          const dimensionKey = labelMatches ? labelMatches[1] : d;
          const dimension = view.dimension({
            cubeDimension: ns.electricitypriceDimension(dimensionKey),
          });

          const labelDimension = view.createDimension({
            source: lookupSource,
            path: ns.schema.name,
            join: dimension,
            as: ns.electricitypriceDimension(`${dimensionKey}Label`),
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
            cubeDimension: ns.electricitypriceDimension(dimensionKey),
          });

          const idDimension = view.createDimension({
            source: lookupSource,
            path: ns.schema.identifier,
            join: dimension,
            as: ns.electricitypriceDimension(`${dimensionKey}Identifier`),
          });

          return dimension ? [dimension, idDimension] : [];
        }

        const dimension = view.dimension({
          cubeDimension: ns.electricitypriceDimension(d),
        });

        // console.log(ns.energyPricing(d).value, dimension);
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

  console.log({
    query: getSparqlEditorUrl(filterView.observationsQuery().query.toString()),
  });

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
        filterValues
          ? buildDimensionFilter(
              view,
              // dim.replace(/^canton/, "region"),
              dim,
              filterValues
            ) ?? []
          : []
      )
    : [];

  const lookupView = new View({ parent: source, filters: queryFilters });

  const dimension = view.dimension({
    cubeDimension: ns.electricitypriceDimension(dimensionKey),
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
    as: ns.electricitypriceDimension(`${dimensionKey}Label`),
  });
  lookupView.addDimension(dimension).addDimension(labelDimension);

  console.log({
    query: getSparqlEditorUrl(lookupView.observationsQuery().query.toString()),
  });

  const observations = await lookupView.observations();

  lookupView.clear();
  lookup.clear();

  return observations.flatMap((obs) => {
    // Filter out "empty" observations
    return obs[ns.electricitypriceDimension(dimensionKey).value]
      ? [
          {
            id: ns.stripNamespaceFromIri({
              iri: obs[ns.electricitypriceDimension(dimensionKey).value]
                .value as string,
            }),
            name: obs[
              ns.electricitypriceDimension(`${dimensionKey}Label`).value
            ].value as string,
            view,
            source,
          },
        ]
      : [];
  });
};

// export const getOperatorMunicipalities()

export const getCubeDimension = (
  view: View,
  dimensionKey: string,
  { locale }: { locale: string }
) => {
  const viewDimension = view.dimension({
    cubeDimension: ns.electricitypriceDimension(dimensionKey),
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
    cubeDimension: ns.electricitypriceDimension(dimensionKey),
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
  client = sparqlClient,
}: {
  id: string;
  client?: ParsingClient;
}): Promise<{ id: string; name: string } | null> => {
  const iri = ns.addNamespaceToID({
    dimension: "municipality",
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

export const getCanton = async ({
  id,
  client = sparqlClient,
  locale,
}: {
  id: string;
  client?: ParsingClient;
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
  client = sparqlClient,
}: {
  id: string;
  client?: ParsingClient;
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
  client = sparqlClient,
}: {
  operatorId: string;
  client?: ParsingClient;
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

  console.log({ query: getSparqlEditorUrl(query) });

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
    const category = ns.electricityprice`documenttype/tariffs_provider`.equals(
      d.category
    )
      ? OperatorDocumentCategory.Tariffs
      : ns.electricityprice`documenttype/annual_report`.equals(d.category)
      ? OperatorDocumentCategory.AnnualReport
      : ns.electricityprice`documenttype/financial_statement`.equals(d.category)
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

export const getSparqlEditorUrl = (query: string): string | null => {
  return process.env.SPARQL_EDITOR
    ? `${process.env.SPARQL_EDITOR}#query=${encodeURIComponent(query)}`
    : query;
};
