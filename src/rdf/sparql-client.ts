import { GetServerSidePropsContext, NextApiRequest } from "next";
import { NextRequest } from "next/server";
import ParsingClient from "sparql-http-client/ParsingClient";

import { parseSessionFromRequest } from "src/admin-auth";
import { SessionPayload } from "src/admin-auth/session";
import server from "src/env/server";

export const defaultSparqlEndpointUrl = server.SPARQL_ENDPOINT;

/**
 * Creates a SPARQL client with the specified endpoint URL.
 */
function createSparqlClient(endpointUrl: string): ParsingClient {
  const client = new ParsingClient({
    endpointUrl,
  });

  // Uncomment to enable verbose logging of SPARQL queries
  // makeClientVerbose(client);
  return client;
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

const getSparqlEndpointFromSession = (session: SessionPayload | null) => {
  return session?.flags.sparqlEndpoint ?? defaultSparqlEndpointUrl;
};

/**
 * Session-aware functions to get SPARQL client from API request.
 * This function tries to get the endpoint from the admin session,
 * then falls back to the default endpoint.
 */
export async function getSparqlClientFromRequest(
  req: NextApiRequest | GetServerSidePropsContext["req"] | NextRequest
): Promise<ParsingClient> {
  const session = await parseSessionFromRequest(req);
  const endpoint = getSparqlEndpointFromSession(session);
  return createSparqlClient(endpoint);
}

export async function getSparqlClientFromGetServerSidePropsContext(ctx: {
  req: GetServerSidePropsContext["req"];
}): Promise<ParsingClient> {
  const session = await parseSessionFromRequest(ctx.req);
  const endpoint = getSparqlEndpointFromSession(session);
  return createSparqlClient(endpoint);
}
