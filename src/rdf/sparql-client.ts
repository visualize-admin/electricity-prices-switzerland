import { GetServerSidePropsContext, NextApiRequest } from "next";
import { NextRequest } from "next/server";
import ParsingClient from "sparql-http-client/ParsingClient";

import server from "src/env/server";

export const endpointUrl = server.SPARQL_ENDPOINT;

/**
 * Creates a SPARQL client with the specified endpoint URL.
 */
function createSparqlClient(endpointUrl: string): ParsingClient {
  return new ParsingClient({
    endpointUrl,
  });
}
function endpointSupportsCachingPerCube(endpointUrl: string): boolean {
  return endpointUrl.includes("cached");
}

export function createSparqlClientForCube(
  endpointUrl: string,
  cubeIri: string
) {
  const maybeCachedEndpointUrl =
    cubeIri && endpointSupportsCachingPerCube(endpointUrl)
      ? `${endpointUrl}/${encodeURIComponent(cubeIri)}`
      : endpointUrl;

  return createSparqlClient(maybeCachedEndpointUrl);
}
/**
 * Session-aware function to get SPARQL client from API request.
 * This function tries to get the endpoint from the admin session,
 * then falls back to the default endpoint.
 */

export async function getSparqlClientFromRequest(
  req: NextApiRequest | GetServerSidePropsContext["req"] | NextRequest
): Promise<ParsingClient> {
  const endpoint = server.SPARQL_ENDPOINT;
  return createSparqlClient(endpoint);
}
