import { SELECT } from "@tpluscode/sparql-builder";
import { Literal, NamedNode, Quad } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import * as ns from "./namespace";


export type SearchResult = {
  id: string;
  name: string;
  type: string;
  isAbolished: boolean;
  /** Space-separated postal codes, only present for municipalities. */
  postalCodes?: string;
};

/**
 * Returns all municipalities that have at least one offer in the electricity
 * price graph, i.e. municipalities with observations.
 */
export const loadAllMunicipalities = async ({
  client,
}: {
  client: ParsingClient;
}): Promise<SearchResult[]> => {
  const query = `
    SELECT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?name) (?class AS ?municipalityClass) (GROUP_CONCAT(DISTINCT STR(?postalCode); separator=" ") AS ?postalCodes) WHERE {
      VALUES ?class {
        <https://schema.ld.admin.ch/Municipality>
        <https://schema.ld.admin.ch/AbolishedMunicipality>
      }
      ?municipality a ?class .
      ?municipality <http://schema.org/name> ?municipalityLabel .
      OPTIONAL { ?municipality <http://schema.org/postalCode> ?postalCode . }
      GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
        [] <http://schema.org/areaServed> ?municipality .
      }
    }
    GROUP BY ?municipality ?municipalityLabel ?class
  `;

  const results = (await client.query.select(query)) as {
    type: Literal;
    iri: NamedNode;
    name: Literal;
    municipalityClass?: NamedNode;
    postalCodes?: Literal;
  }[];

  return results.map((d) => ({
    id: ns.stripNamespaceFromIri({ iri: d.iri.value }),
    name: d.name.value,
    type: d.type.value,
    isAbolished: ns.schemaAdmin`AbolishedMunicipality`.equals(
      d.municipalityClass
    ),
    postalCodes: d.postalCodes?.value || undefined,
  }));
};

/**
 * Returns all operators that have at least one offer in the electricity
 * price graph, i.e. operators with observations.
 */
export const loadAllOperators = async ({
  client,
}: {
  client: ParsingClient;
}): Promise<SearchResult[]> => {
  const query = `
    SELECT DISTINCT ("operator" AS ?type) (?operator AS ?iri) (?operatorLabel AS ?name) WHERE {
      GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
        ?operator a <http://schema.org/Organization> .
        ?operator <http://schema.org/name> ?operatorLabel .
        [] <http://schema.org/offeredBy> ?operator .
      }
    }
  `;

  const results = (await client.query.select(query)) as {
    type: Literal;
    iri: NamedNode;
    name: Literal;
  }[];

  return results.map((d) => ({
    id: ns.stripNamespaceFromIri({ iri: d.iri.value }),
    name: d.name.value,
    type: d.type.value,
    isAbolished: false,
  }));
};

/**
 * Returns all cantons for the given locale.
 */
export const loadAllCantons = async ({
  client,
  locale,
}: {
  client: ParsingClient;
  locale: string;
}): Promise<SearchResult[]> => {
  const query = `
    SELECT DISTINCT ("canton" AS ?type) (?canton AS ?iri) (?cantonLabel AS ?name) WHERE {
      ?canton a <https://schema.ld.admin.ch/Canton> .
      ?canton <http://schema.org/name> ?cantonLabel .
      FILTER (LANGMATCHES(LANG(?cantonLabel), "${locale}"))
    }
  `;

  const results = (await client.query.select(query)) as {
    type: Literal;
    iri: NamedNode;
    name: Literal;
  }[];

  return results.map((d) => ({
    id: ns.stripNamespaceFromIri({ iri: d.iri.value }),
    name: d.name.value,
    type: d.type.value,
    isAbolished: false,
  }));
};

const getOperatorQuery = ({ operatorId }: { operatorId: string }) => {
  return SELECT`?uid`.WHERE`
    <https://energy.ld.admin.ch/elcom/electricityprice/operator/${operatorId}> a ${ns.schema.Organization} ;
      ${ns.schema.identifier} ?uid
  `;
};

export const fetchOperatorInfo = async ({
  operatorId,
  client,
}: {
  operatorId: string;
  client: ParsingClient<Quad>;
}) => {
  const sparqlQuery = getOperatorQuery({ operatorId });
  const results = (await client.query.select(sparqlQuery.build())) as {
    uid: Literal;
  }[];

  if (results.length > 1) {
    console.warn(`Multiple uid results for operator id ${operatorId}`);
  } else if (results.length === 0) {
    console.warn(`No uid results for operator id ${operatorId}`);
  }

  return {
    query: sparqlQuery.build(),
    data: results.map((d) => {
      const uid = d.uid.value;
      return {
        uid,
      };
    })[0],
  };
};
