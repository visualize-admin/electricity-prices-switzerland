import { GetServerSidePropsContext } from "next";

import server from "src/env/server";

import { getSessionConfigFlagsFromContext } from "./session";

export interface SessionConfigFlagInfo {
  value: string;
  default: string;
  label: string;
}

/**
 * Gets comprehensive session config flag information for debug component.
 */
export async function getSessionConfigFlagsInfo(
  context: GetServerSidePropsContext
) {
  const flags = await getSessionConfigFlagsFromContext(context);

  return {
    flags: {
      sparqlEndpoint: {
        value: flags.sparqlEndpoint,
        default: server.SPARQL_ENDPOINT,
        label: "SPARQL Endpoint",
      },
    },
  };
}
