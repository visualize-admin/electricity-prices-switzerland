import ParsingClient from "sparql-http-client/ParsingClient";

const SPARQL_ENDPOINT = "https://cached.lindas.admin.ch/query";
const SPARQL_TEST_ENDPOINT = "https://test.lindas.admin.ch/query";

export const sparqlClient = new ParsingClient({
  endpointUrl: SPARQL_ENDPOINT,
});

export const sparqlTestClient = new ParsingClient({
  endpointUrl: SPARQL_TEST_ENDPOINT,
});
