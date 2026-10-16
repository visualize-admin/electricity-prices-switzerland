import { Literal, NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import { PriceComponent } from "src/graphql/resolver-types";
import { Observation, parseObservation } from "src/lib/observations";
import * as ns from "src/rdf/namespace";

import { createSparqlClientForCube } from "./sparql-client";

/**
 * Hand-written SPARQL replacements for the rdf-cube-view-query based functions
 * in `queries.ts`. They reproduce the queries the library generates.
 */

type Filters = { [key: string]: string[] | null | undefined } | null;

type CubeDimension = { path: string; datatype: string | undefined };

export class CubeNotFoundError extends Error {}

const CUBE_UNDEFINED = "https://cube.link/Undefined";

const iri = (value: string) => {
  if (/[\s<>"{}|^`\\]/.test(value)) {
    throw Error(`Invalid IRI: ${value}`);
  }
  return `<${value}>`;
};

const variable = (key: string) => {
  if (!/^\w+$/.test(key)) {
    throw Error(`Invalid dimension key: ${key}`);
  }
  return `?${key}`;
};

const cubeClient = (client: ParsingClient, cubeIri: string) =>
  createSparqlClientForCube(client.query.endpoint.endpointUrl, cubeIri);

/**
 * Dimensions of the cube shape, keyed by dimension key (e.g. "period").
 * Throws when the cube does not exist or has no dimensions.
 */
export const getCubeDimensions = async (
  client: ParsingClient,
  cubeIri: string
): Promise<Map<string, CubeDimension>> => {
  const query = /*sparql*/ `
PREFIX cube: <https://cube.link/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?path ?datatype WHERE {
  ${iri(cubeIri)} cube:observationConstraint ?shape .
  ?shape sh:property ?property .
  ?property sh:path ?path .
  FILTER (?path != rdf:type)
  OPTIONAL { ?property sh:datatype ?datatype . }
}
`;
  const rows = await cubeClient(client, cubeIri).query.select(query);
  if (rows.length === 0) {
    throw new CubeNotFoundError(
      `Cube ${cubeIri} not found or has no dimensions`
    );
  }

  const dimensionPrefix = ns.electricityPriceDimension().value;
  return new Map(
    rows.map((row) => [
      row.path.value.replace(dimensionPrefix, ""),
      { path: row.path.value, datatype: row.datatype?.value },
    ])
  );
};

const labelPattern = (subject: string, label: string, locale: string) => `
  OPTIONAL {
    ${subject} <http://schema.org/name> ${label}_lang .
    FILTER (LANGMATCHES(LANG(${label}_lang), ${JSON.stringify(locale)}))
  }
  OPTIONAL {
    ${subject} <http://schema.org/name> ${label}_none .
    FILTER (LANG(${label}_none) = "")
  }
  BIND(COALESCE(${label}_lang, ${label}_none) AS ${label})`;

const filterPattern = (
  key: string,
  dimension: CubeDimension,
  values: string[]
) => {
  const terms = values.map((value) =>
    dimension.datatype
      ? `${JSON.stringify(value)}^^${iri(dimension.datatype)}`
      : iri(ns.addNamespaceToID({ id: value, dimension: key }))
  );
  return terms.length === 1
    ? `FILTER (${variable(key)} = ${terms[0]})`
    : `FILTER (${variable(key)} IN (${terms.join(", ")}))`;
};

/**
 * Builds the observation patterns shared by both queries: one triple per bound
 * dimension and one FILTER per filter on a dimension of the cube. Filters on
 * dimensions the cube does not have are ignored, as rdf-cube-view-query does.
 */
const observationPatterns = (
  cubeIri: string,
  cubeDimensions: Map<string, CubeDimension>,
  boundKeys: Set<string>,
  filters: Filters | undefined
) => {
  const keys = new Set(boundKeys);
  const filterPatterns = Object.entries(filters ?? {}).flatMap(
    ([key, values]) => {
      const dimension = cubeDimensions.get(key);
      if (!values) {
        return [];
      }
      if (!dimension) {
        console.warn(`buildDimensionFilter: No dimension for '${key}'`);
        return [];
      }
      keys.add(key);
      return [filterPattern(key, dimension, values)];
    }
  );

  return [
    `${iri(
      cubeIri
    )} <https://cube.link/observationSet>/<https://cube.link/observation> ?obs .`,
    ...Array.from(keys).map(
      (key) => `?obs ${iri(cubeDimensions.get(key)!.path)} ${variable(key)} .`
    ),
    ...filterPatterns,
  ];
};

const priceComponents = Object.values(PriceComponent) as string[];

const buildObservationsQuery = ({
  cubeIri,
  cubeDimensions,
  locale,
  filters,
  dimensions,
}: {
  cubeIri: string;
  cubeDimensions: Map<string, CubeDimension>;
  locale: string;
  filters?: Filters;
  dimensions: string[];
}) => {
  // Dimensions read from the observation, and lookups joined on them
  const boundKeys = new Set<string>();
  const labelKeys = new Set<string>();
  const identifierKeys = new Set<string>();
  const extraPatterns: string[] = [];

  const requestedPriceComponents = dimensions.filter((d) =>
    priceComponents.includes(d)
  );

  for (const d of dimensions) {
    const labelMatches = d.match(/^(.+)Label$/);
    const identifierMatches = labelMatches ? null : d.match(/^(.+)Identifier$/);
    const key = labelMatches?.[1] ?? identifierMatches?.[1] ?? d;

    if (!cubeDimensions.has(key)) {
      console.warn(`No dimension found for ${d}`);
      continue;
    }

    boundKeys.add(key);
    if (labelMatches) {
      labelKeys.add(key);
    } else if (identifierMatches) {
      identifierKeys.add(key);
    } else if (
      requestedPriceComponents.length === 1 &&
      requestedPriceComponents[0] === d
    ) {
      // If we are only querying 1 dimension that can contain undefined, we can
      // filter out rows with undefined values on this particular column
      extraPatterns.push(
        `FILTER (DATATYPE(${variable(d)}) != ${iri(CUBE_UNDEFINED)})`
      );
    }
  }

  const labelPatterns = Array.from(labelKeys).map((key) =>
    labelPattern(variable(key), variable(`${key}Label`), locale)
  );

  const identifierPatterns = Array.from(identifierKeys).map(
    (key) =>
      `${variable(key)} <http://schema.org/identifier> ${variable(
        `${key}Identifier`
      )} .`
  );

  const patterns = observationPatterns(
    cubeIri,
    cubeDimensions,
    boundKeys,
    filters
  );

  const keys = [
    ...Array.from(boundKeys),
    ...Array.from(labelKeys).map((key) => `${key}Label`),
    ...Array.from(identifierKeys).map((key) => `${key}Identifier`),
  ];

  const query = `SELECT DISTINCT ${keys.map(variable).join(" ")} WHERE {
  ${[
    ...patterns,
    ...identifierPatterns,
    ...extraPatterns,
    ...labelPatterns,
  ].join("\n  ")}
}`;

  return { query, keys };
};

export const getObservations = async (
  {
    client,
    cubeIri,
    locale,
  }: {
    client: ParsingClient;
    cubeIri: string;
    locale: string;
  },
  { filters, dimensions }: { filters?: Filters; dimensions: string[] }
): Promise<Observation[]> => {
  const cubeDimensions = await getCubeDimensions(client, cubeIri);
  const { query, keys } = buildObservationsQuery({
    cubeIri,
    cubeDimensions,
    locale,
    filters,
    dimensions,
  });

  const rows = await cubeClient(client, cubeIri).query.select(query);

  return rows.map((row) =>
    parseObservation(
      Object.fromEntries(
        keys.map((key) => [key, (row[key] as Literal | NamedNode) ?? null])
      )
    )
  );
};

export const getDimensionValuesAndLabels = async ({
  client,
  cubeIri,
  dimensionKey,
  filters,
}: {
  client: ParsingClient;
  cubeIri: string;
  dimensionKey: string;
  filters?: Filters;
}): Promise<{ id: string; name: string }[]> => {
  const cubeDimensions = await getCubeDimensions(client, cubeIri);
  if (!cubeDimensions.has(dimensionKey)) {
    throw Error(
      `getDimensionValuesAndLabels: No dimension for '${dimensionKey}'`
    );
  }

  const labelPath =
    dimensionKey === "region"
      ? "http://schema.org/alternateName"
      : "http://schema.org/name";
  const patterns = observationPatterns(
    cubeIri,
    cubeDimensions,
    new Set([dimensionKey]),
    filters
  );

  const query = `SELECT DISTINCT ${variable(dimensionKey)} ?label WHERE {
  ${patterns.join("\n  ")}
  ${variable(dimensionKey)} ${iri(labelPath)} ?label .
}`;

  const rows = await cubeClient(client, cubeIri).query.select(query);

  return rows.flatMap((row) =>
    row[dimensionKey]
      ? [
          {
            id: ns.stripNamespaceFromIri({ iri: row[dimensionKey].value }),
            name: row.label.value,
          },
        ]
      : []
  );
};
