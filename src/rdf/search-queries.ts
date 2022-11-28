import { sparql, SparqlTemplateResult } from "@tpluscode/rdf-string";
import { SELECT } from "@tpluscode/sparql-builder";
import rdf from "rdf-ext";
import { Literal, NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { defaultLocale } from "../locales/locales";
import * as ns from "./namespace";
import { getSparqlEditorUrl } from "./queries";
import { sparqlClient } from "./sparql-client";

// regex based search query for municipalities and operators
type SearchType = "municipality" | "operator" | "canton";

const vars = {
  type: rdf.variable("type"),
  iri: rdf.variable("iri"),
  municipalityClass: rdf.variable("municipalityClass"),
  name: rdf.variable("name"),
};

const graphs = {
  electricityprice: rdf.namedNode(
    "https://lindas.admin.ch/elcom/electricityprice"
  ),
};

const searchQueryBuilders = {
  zipCode: ({ query }: { query: string }) => {
    return sparql`{
    SELECT DISTINCT ("municipality" AS ${vars.type}) (?municipality AS ${vars.iri}) (?municipalityLabel AS ${vars.name})
      WHERE { GRAPH ${graphs.electricityprice} {
        ?offer a ${ns.schema.Offer} ;
          ${ns.schema.areaServed} ?municipality;
          ${ns.schema.postalCode} "${query}" .
        }
        ?municipality ${ns.schema.name} ?municipalityLabel .
    }
  }`;
  },
  query: {
    municipality: ({ query, limit }: { query: string; limit: number }) => {
      return sparql`{
      SELECT DISTINCT ("municipality" AS ${vars.type}) (?municipality AS ${vars.iri}) (?municipalityLabel AS ${vars.name}) (?class as ?municipalityClass) WHERE {
        VALUES ?class { ${ns.schemaAdmin.Municipality} ${ns.schemaAdmin.AbolishedMunicipality} }
        ?municipality a ?class .
        ?municipality ${ns.schema.name} ?municipalityLabel .
        FILTER (regex(?municipalityLabel, ".*${query}.*", "i"))
      } LIMIT ${limit}
    }`;
    },

    operator: ({ query, limit }: { query: string; limit: number }) => {
      return sparql`{
      SELECT DISTINCT ("operator" AS ${vars.type}) (?operator AS ${vars.iri}) (?operatorLabel AS ${vars.name}) WHERE {
        GRAPH ${graphs.electricityprice} {
          ?operator a ${ns.schema.Organization} .
          ?operator ${ns.schema.name} ?operatorLabel.    
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
      return sparql`{
      SELECT DISTINCT ("canton" AS ${vars.type}) (?canton AS ${vars.iri}) (?cantonLabel AS ${vars.name}) WHERE {
        ?canton a ${ns.schemaAdmin.Canton} .
        ?canton ${ns.schema.name} ?cantonLabel .    
        FILTER (LANGMATCHES(LANG(?cantonLabel), "${locale}") && (regex(?cantonLabel, ".*${query}.*", "i")))
      } LIMIT ${limit}
    }`;
    },
  },
  ids: {
    canton: ({ ids, locale }: { ids: string[]; locale: string }) => {
      return sparql`{
      SELECT DISTINCT ("canton" AS ${vars.type}) (?canton AS ${
        vars.iri
      }) (?cantonLabel AS ${vars.name}) WHERE {
        ?canton a ${ns.schemaAdmin.Canton} .
        ?canton ${ns.schema.name} ?cantonLabel .
        FILTER (LANGMATCHES(LANG(?cantonLabel), "${locale}") && (?canton IN (${ids
        .map((id) => `<${ns.canton(id).value}>`)
        .join(",")})))
      }
    }`;
    },
    municipality: ({ ids, locale }: { ids: string[]; locale: string }) => {
      return sparql`{
        SELECT DISTINCT ("municipality" AS ${vars.type}) (?municipality AS ${
        vars.iri
      }) (?municipalityLabel AS ${vars.name}) WHERE {
          VALUES ?class { ${ns.schemaAdmin.Municipality} ${
        ns.schemaAdmin.AbolishedMunicipality
      } }
          ?municipality a ?class .
          ?municipality ${ns.schema.name} ?municipalityLabel .
          FILTER (?municipality IN (${ids
            .map((id) => `<${ns.municipality(id).value}>`)
            .join(",")}))
        }
      }`;
    },
    operator: ({ ids, locale }: { ids: string[]; locale: string }) => {
      return sparql`{
        SELECT DISTINCT ("operator" AS ${vars.type}) (?operator AS ${
        vars.iri
      }) (?operatorLabel AS ${vars.name}) WHERE {
          GRAPH ${graphs.electricityprice} {
            ?operator a ${ns.schema.Organization} .
            ?operator ${ns.schema.name} ?operatorLabel.    
          }
          FILTER (?operator IN (${ids
            .map((id) => `<${ns.electricityprice(`operator/${id}`).value}>`)
            .join(",")}))
        }
      }`;
    },
  },
} as const;

export type SearchSparqlQueryOptions = {
  query: string;
  ids: string[];
  locale: string;
  types: SearchType[];
  limit?: number;
};

export const getSearchSparqlQuery = ({
  query,
  types,
  ids,
  limit,
  locale,
}: Required<SearchSparqlQueryOptions>) => {
  const trimmedQuery = query.trim();
  const isZipCode = /^[0-9]{4}$/.test(trimmedQuery);
  let queryParts: SparqlTemplateResult[] = [];

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

  const sparqlQuery =
    SELECT.DISTINCT`${vars.type} ${vars.iri} ${vars.name} ${vars.municipalityClass}`
      .WHERE`${queryParts.map((p, i) =>
      i < queryParts.length - 1 ? sparql`${p} UNION ` : p
    )}`
      .ORDER()
      .BY(vars.name);

  return {
    sparqlQuery,
    abort: queryParts.length === 0,
  };
};

export const search = async ({
  query,
  ids,
  client = sparqlClient,
  locale = defaultLocale,
  types = ["municipality", "operator"],
  limit = 10,
}: SearchSparqlQueryOptions & {
  client?: ParsingClient;
}) => {
  const { sparqlQuery, abort } = getSearchSparqlQuery({
    query,
    types,
    ids,
    locale,
    limit,
  });
  if (abort) {
    return [];
  }

  console.log(
    `SEARCH query for '${query}'`,
    getSparqlEditorUrl(sparqlQuery.build())
  );

  const results = (await client.query.select(sparqlQuery.build())) as {
    type: Literal;
    iri: NamedNode;
    name: Literal;
    municipalityClass?: NamedNode;
  }[];

  return results.map((d) => {
    const iri = d.iri.value;
    const type = d.type.value;
    const name = d.name.value;

    const isAbolished = ns.schemaAdmin`AbolishedMunicipality`.equals(
      d.municipalityClass
    );

    return {
      id: ns.stripNamespaceFromIri({ dimension: type, iri }),
      name,
      type,
      isAbolished,
    };
  });
};
