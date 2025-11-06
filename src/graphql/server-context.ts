import { GetServerSidePropsContext, NextApiRequest } from "next";
import ParsingClient from "sparql-http-client/ParsingClient";

import { getSparqlClientFromRequest } from "src/rdf/sparql-client";
import {
  getSunshineDataServiceFromApiRequest,
  getSunshineDataServiceFromGetServerSidePropsContext,
  SunshineDataService,
} from "src/lib/sunshine-data-service";
import {
  getDefaultedFlags,
  getSessionConfigFlagsFromCookies,
  SessionConfigFlags,
} from "src/session-config";
import { getSparqlClientFromGetServerSidePropsContext } from "src/lib/sparql-client-context";

export type GraphqlRequestContext = {
  sunshineDataService: SunshineDataService;
  sparqlClient: ParsingClient;
  flags: SessionConfigFlags;
};

export const contextFromAPIRequest = async (
  req: NextApiRequest
): Promise<GraphqlRequestContext> => {
  const sunshineDataService = await getSunshineDataServiceFromApiRequest(req);
  const sparqlClient = await getSparqlClientFromRequest(req);
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
  const sunshineDataService =
    await getSunshineDataServiceFromGetServerSidePropsContext(ctx);
  const sparqlClient = await getSparqlClientFromGetServerSidePropsContext(ctx);
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
