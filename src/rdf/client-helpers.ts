import ParsingClient from "sparql-http-client/ParsingClient";

export const makeClientVerbose = (client: ParsingClient): ParsingClient => {
  const originalQuery = client.query;
  const endpoint = client.query.endpoint.endpointUrl;
  client.query = {
    ...originalQuery,
    select: async (query: string) => {
      // eslint-disable-next-line no-console
      console.log(`SPARQL Query against ${endpoint}:\n`, query);
      return originalQuery.select(query);
    },
    construct: async (query: string) => {
      // eslint-disable-next-line no-console
      console.log(`SPARQL Query against ${endpoint}:\n`, query);
      return originalQuery.construct(query);
    },
    ask: async (query: string) => {
      // eslint-disable-next-line no-console
      console.log(`SPARQL Query against ${endpoint}:\n`, query);
      return originalQuery.ask(query);
    },
    update: async (query: string) => {
      // eslint-disable-next-line no-console
      console.log(`SPARQL Query against ${endpoint}:\n`, query);
      return originalQuery.update(query);
    },
  };
  return client;
};
