import { Literal, NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { defaultLocale } from "../locales/locales";
import { sparqlClient } from "./sparql-client";
import * as ns from "./namespace";

// regex based search query for municipalities and operators
type SearchType = "municipality" | "operator" | "canton";

const searchQueryBuilders = {
  zipCode: ({ query }: { query: string }) => {
    return `{
    SELECT DISTINCT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?name)
      WHERE { GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
        ?offer a schema:Offer ;
          schema:areaServed ?municipality;
          schema:postalCode "${query}" .
        }
        { GRAPH <https://lindas.admin.ch/fso/agvch> {
          ?municipality schema:name ?municipalityLabel .
        }}
    }
  }`;
  },
  query: {
    municipality: ({ query, limit }: { query: string; limit: number }) => {
      return `{
      SELECT DISTINCT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/fso/agvch> {
          VALUES ?class { <https://schema.ld.admin.ch/Municipality> <https://schema.ld.admin.ch/AbolishedMunicipality> }
          ?municipality a ?class .
          ?municipality <http://schema.org/name> ?municipalityLabel .
        }
        FILTER (regex(?municipalityLabel, ".*${query}.*", "i"))
      } LIMIT ${limit}
    }`;
    },

    operator: ({ query, limit }: { query: string; limit: number }) => {
      return `{
      SELECT DISTINCT ("operator" AS ?type) (?operator AS ?iri) (?operatorLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
          ?operator a <http://schema.org/Organization> .
          ?operator <http://schema.org/name> ?operatorLabel.    
        }
        FILTER (regex(?operatorLabel, ".*${query}.*", "i"))
      } LIMIT ${limit}
    }`;
    },
    canton: ({
      query,
      limit,
      locale,
    }: {
      query: string;
      limit: number;
      locale: string;
    }) => {
      return `{
      SELECT DISTINCT ("canton" AS ?type) (?canton AS ?iri) (?cantonLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/fso/agvch> {
          ?canton a <https://schema.ld.admin.ch/Canton> .
          ?canton <http://schema.org/name> ?cantonLabel .    
        }
        FILTER (LANGMATCHES(LANG(?cantonLabel), "${locale}") && (regex(?cantonLabel, ".*${query}.*", "i")))
      } LIMIT ${limit}
    }`;
    },
  },
  ids: {
    canton: ({ ids, locale }: { ids: string[]; locale: string }) => {
      return `{
      SELECT DISTINCT ("canton" AS ?type) (?canton AS ?iri) (?cantonLabel AS ?name) WHERE {
        GRAPH <https://lindas.admin.ch/fso/agvch> {
          ?canton a <https://schema.ld.admin.ch/Canton> .
          ?canton <http://schema.org/name> ?cantonLabel .
        }
        FILTER (LANGMATCHES(LANG(?cantonLabel), "${locale}") && (?canton IN (${ids
        .map((id) => `<${ns.canton(id).value}>`)
        .join(",")})))
      }
    }`;
    },
    municipality: ({ ids, locale }: { ids: string[]; locale: string }) => {
      return `{
        SELECT DISTINCT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?name) WHERE {
          GRAPH <https://lindas.admin.ch/fso/agvch> {
            VALUES ?class { <https://schema.ld.admin.ch/Municipality> <https://schema.ld.admin.ch/AbolishedMunicipality> }
            ?municipality a ?class .
            ?municipality <http://schema.org/name> ?municipalityLabel .
          }
          FILTER (?municipality IN (${ids
            .map((id) => `<${ns.municipality(id).value}>`)
            .join(",")}))
        }
      }`;
    },
    operator: ({ ids, locale }: { ids: string[]; locale: string }) => {
      return `{
        SELECT DISTINCT ("operator" AS ?type) (?operator AS ?iri) (?operatorLabel AS ?name) WHERE {
          GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
            ?operator a <http://schema.org/Organization> .
            ?operator <http://schema.org/name> ?operatorLabel.    
          }
          FILTER (?operator IN (${ids
            .map((id) => `<${ns.electricityprice(`operator/${id}`).value}>`)
            .join(",")}))
        }
      }`;
    },
  },
} as const;

export const search = async ({
  query,
  ids,
  client = sparqlClient,
  locale = defaultLocale,
  types = ["municipality", "operator"],
  limit = 10,
}: {
  client?: ParsingClient;
  query: string;
  ids: string[];
  locale: string;
  types?: SearchType[];
  limit?: number;
}) => {
  const trimmedQuery = query.trim();
  const isZipCode = /^[0-9]{4}$/.test(trimmedQuery);
  let queryParts: string[] = [];

  if (isZipCode && types.includes("municipality")) {
    queryParts.push(searchQueryBuilders.zipCode({ query: trimmedQuery }));
  }

  if (ids.length > 0) {
    queryParts.push(
      ...types.map((t) =>
        searchQueryBuilders.ids[t]({
          ids,
          locale,
        })
      )
    );
  }

  if (!isZipCode && trimmedQuery !== "") {
    queryParts.push(
      ...types.map((t) =>
        searchQueryBuilders.query[t]({
          query: trimmedQuery,
          limit,
          locale,
        })
      )
    );
  }

  if (queryParts.length === 0) {
    return [];
  }

  const sparql = `
  PREFIX schema: <http://schema.org/>
  PREFIX lac: <https://schema.ld.admin.ch/>
  SELECT DISTINCT ?type ?iri ?name {
    ${queryParts.join(" UNION ")}    
  } ORDER BY ?name
  `;

  console.log(sparql);

  const results = (await client.query.select(sparql)) as {
    type: Literal;
    iri: NamedNode;
    name: Literal;
  }[];

  return results.map((d) => {
    const iri = d.iri.value;
    const type = d.type.value;
    const name = d.name.value;

    return {
      id: ns.stripNamespaceFromIri({ dimension: type, iri }),
      name,
      type,
    };
  });
};
