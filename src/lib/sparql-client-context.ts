import { GetServerSidePropsContext } from "next";
import ParsingClient from "sparql-http-client/ParsingClient";

import server from "src/env/server";
import { createSparqlClient } from "src/rdf/sparql-client";

export async function getSparqlClientFromGetServerSidePropsContext(_ctx: {
  req: GetServerSidePropsContext["req"];
}): Promise<ParsingClient> {
  const endpoint = server.SPARQL_ENDPOINT;
  return createSparqlClient(endpoint);
}
