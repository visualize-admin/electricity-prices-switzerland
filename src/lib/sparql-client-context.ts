import { GetServerSidePropsContext } from "next";
import ParsingClient from "sparql-http-client/ParsingClient";

import server from "src/env/server";

export async function getSparqlClientFromGetServerSidePropsContext(_ctx: {
  req: GetServerSidePropsContext["req"];
}): Promise<ParsingClient> {
  const endpoint = server.SPARQL_ENDPOINT;
  return new ParsingClient({
    endpointUrl: endpoint,
  });
}
