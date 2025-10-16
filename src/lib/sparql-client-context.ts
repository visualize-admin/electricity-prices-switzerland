import { GetServerSidePropsContext, NextApiRequest } from "next";
import ParsingClient from "sparql-http-client/ParsingClient";

import server from "src/env/server";

/**
 * Get SPARQL client from API request
 * Right now, the client does not depend on the request, but in the future, we
 * want to have different clients based on request headers.
 */
export async function getSparqlClientFromApiRequest(
  _req: NextApiRequest
): Promise<ParsingClient> {
  const endpoint = server.SPARQL_ENDPOINT;
  return new ParsingClient({
    endpointUrl: endpoint,
  });
}

export async function getSparqlClientFromGetServerSidePropsContext(_ctx: {
  req: GetServerSidePropsContext["req"];
}): Promise<ParsingClient> {
  const endpoint = server.SPARQL_ENDPOINT;
  return new ParsingClient({
    endpointUrl: endpoint,
  });
}
