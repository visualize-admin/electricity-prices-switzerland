import { GetServerSidePropsContext, NextApiRequest } from "next";
import ParsingClient from "sparql-http-client/ParsingClient";

import {
  getSparqlClientFromGetServerSidePropsContext,
  getSparqlClientFromRequest,
} from "src/rdf/sparql-client";
import { SunshineDataService } from "src/lib/sunshine-data-service";
import {
  getDefaultedFlags,
  getSessionConfigFlagsFromCookies,
  SessionConfigFlags,
} from "src/session-config";
import { createSunshineDataService } from "src/rdf/sunshine";

export type GraphqlRequestContext = {
  sunshineDataService: SunshineDataService;
  sparqlClient: ParsingClient;
  flags: SessionConfigFlags;
};

export const contextFromAPIRequest = async (
  req: NextApiRequest
): Promise<GraphqlRequestContext> => {
  const sparqlClient = await getSparqlClientFromRequest(req);
  const sunshineDataService = createSunshineDataService(sparqlClient);
  const partialFlags = await getSessionConfigFlagsFromCookies(
    req.headers.cookie
  );
  const flags = getDefaultedFlags(partialFlags);

  return {
    sunshineDataService,
    flags,
    sparqlClient,
  };
};

export const contextFromGetServerSidePropsContext = async (
  ctx: Pick<GetServerSidePropsContext, "req">
): Promise<GraphqlRequestContext> => {
  const sparqlClient = await getSparqlClientFromGetServerSidePropsContext(ctx);
  const sunshineDataService = createSunshineDataService(sparqlClient);
  const partialFlags = await getSessionConfigFlagsFromCookies(
    ctx.req.headers.cookie
  );
  const flags = getDefaultedFlags(partialFlags);

  return {
    sunshineDataService,
    sparqlClient,
    flags,
  };
};
