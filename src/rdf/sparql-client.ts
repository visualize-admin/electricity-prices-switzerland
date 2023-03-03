import ParsingClient from "sparql-http-client/ParsingClient";

export const sparqlClient = new ParsingClient({
  endpointUrl:
    process.env.SPARQL_ENDPOINT ?? "https://test.lindas.admin.ch/query",
});
