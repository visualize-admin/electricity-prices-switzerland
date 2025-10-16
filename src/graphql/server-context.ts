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

export type GraphqlRequestContext = {
  sunshineDataService: SunshineDataService;
  sparqlClient: ParsingClient;
};

export const contextFromAPIRequest = async (
  req: NextApiRequest
): Promise<GraphqlRequestContext> => {
  const sunshineDataService = getSunshineDataServiceFromApiRequest(req);
  const sparqlClient = await getSparqlClientFromApiRequest(req);

  return {
    sunshineDataService,
    sparqlClient,
  };
};

export const contextFromGetServerSidePropsContext = async (
  ctx: Pick<GetServerSidePropsContext, "req">
): Promise<GraphqlRequestContext> => {
  const sunshineDataService =
    getSunshineDataServiceFromGetServerSidePropsContext(ctx);
  const sparqlClient = await getSparqlClientFromGetServerSidePropsContext(ctx);

  return {
    sunshineDataService,
    sparqlClient,
  };
};
