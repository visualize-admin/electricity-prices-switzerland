import { GetServerSidePropsContext, NextApiRequest } from "next";
import { SunshineDataService } from "src/lib/sunshine-data-service";
import {
  getSunshineDataServiceFromApiRequest,
  getSunshineDataServiceFromGetServerSidePropsContext,
} from "src/lib/sunshine-data-service-context";
import {
  getSparqlClientFromApiRequest,
  getSparqlClientFromGetServerSidePropsContext,
} from "src/lib/sparql-client-context";
import ParsingClient from "sparql-http-client/ParsingClient";
import {
  getDefaultedFlags,
  getSessionConfigFlagsFromCookies,
  SessionConfigFlags,
} from "src/session-config";

export type GraphqlRequestContext = {
  sunshineDataService: SunshineDataService;
  sparqlClient: ParsingClient;
  flags: SessionConfigFlags;
};

export const contextFromAPIRequest = async (
  req: NextApiRequest
): Promise<GraphqlRequestContext> => {
  const sunshineDataService = await getSunshineDataServiceFromApiRequest(req);
  const sparqlClient = await getSparqlClientFromApiRequest(req);
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
    getSunshineDataServiceFromGetServerSidePropsContext(ctx);
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
