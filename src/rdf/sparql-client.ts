import ParsingClient from "sparql-http-client/ParsingClient";

export const sparqlClient = new ParsingClient({
  endpointUrl:
    process.env.SPARQL_ENDPOINT ?? "https://test.lindas.admin.ch/query",
});

export const intSparqlClient = new ParsingClient({
  endpointUrl: "https://int.lindas.admin.ch/query",
});
