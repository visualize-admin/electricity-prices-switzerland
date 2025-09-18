import { GetServerSidePropsContext } from "next";

import server from "src/env/server";
import { DEFAULT_DATABASE_SERVICE_KEY } from "src/lib/sunshine-data-service";

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
): Promise<{
  flags: Record<string, SessionConfigFlagInfo>;
}> {
  const flags = await getSessionConfigFlagsFromContext(context);

  return {
    flags: {
      sunshineDataService: {
        value: flags.sunshineDataService,
        default: DEFAULT_DATABASE_SERVICE_KEY,
        label: "Sunshine Data Service",
      },
      sparqlEndpoint: {
        value: flags.sparqlEndpoint,
        default: server.SPARQL_ENDPOINT,
        label: "SPARQL Endpoint",
      },
    },
  };
}
