import ParsingClient from "sparql-http-client/ParsingClient";

export const endpointUrl = process.env.SPARQL_ENDPOINT;

export const sparqlClient = new ParsingClient({
  endpointUrl: endpointUrl ?? "https://test.lindas.admin.ch/query",
});
