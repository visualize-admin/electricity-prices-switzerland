import { GetServerSidePropsContext, NextApiRequest } from "next";
import ParsingClient from "sparql-http-client/ParsingClient";

import {
  getDefaultedFlags,
  getSessionConfigFlagsFromCookies,
  SessionConfigFlags,
} from "src/admin-auth";
import serverEnv from "src/env/server";
import { SunshineDataService } from "src/lib/sunshine-data-service";
import {
  getSparqlClientFromGetServerSidePropsContext,
  getSparqlClientFromRequest,
} from "src/rdf/sparql-client";
import { createSunshineDataService } from "src/rdf/sunshine";

export type GraphqlRequestContext = {
  sunshineDataService: SunshineDataService;
  sparqlClient: ParsingClient;
  flags: SessionConfigFlags;
  isGeverDebugAuthorized: boolean;
};

export const contextFromAPIRequest = async (
  req: NextApiRequest,
): Promise<GraphqlRequestContext> => {
  const sparqlClient = await getSparqlClientFromRequest(req);
  const sunshineDataService = createSunshineDataService(sparqlClient);
  const partialFlags = await getSessionConfigFlagsFromCookies(
    req.headers.cookie,
  );
  const flags = getDefaultedFlags(partialFlags);

  const debugSecret = Array.isArray(req.headers["x-gever-debug-secret"])
    ? req.headers["x-gever-debug-secret"][0]
    : req.headers["x-gever-debug-secret"];

  const isGeverDebugAuthorized =
    !!debugSecret && debugSecret === serverEnv.DEBUG_DOWNLOAD_SECRET;

  console.log(`Gever debug authorized: ${isGeverDebugAuthorized}`);

  return {
    sunshineDataService,
    flags,
    sparqlClient,
    isGeverDebugAuthorized,
  };
};

export const contextFromGetServerSidePropsContext = async (
  ctx: Pick<GetServerSidePropsContext, "req">,
): Promise<GraphqlRequestContext> => {
  const sparqlClient = await getSparqlClientFromGetServerSidePropsContext(ctx);
  const sunshineDataService = createSunshineDataService(sparqlClient);
  const partialFlags = await getSessionConfigFlagsFromCookies(
    ctx.req.headers.cookie,
  );
  const flags = getDefaultedFlags(partialFlags);

  return {
    sunshineDataService,
    sparqlClient,
    flags,
    isGeverDebugAuthorized: false,
  };
};
