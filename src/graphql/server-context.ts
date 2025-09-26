import { NextApiRequest } from "next";
import { SunshineDataService } from "src/lib/sunshine-data-service";
import { getSunshineDataServiceFromApiRequest } from "src/lib/sunshine-data-service-context";
import { getSparqlClientFromApiRequest } from "src/lib/sparql-client-context";
import ParsingClient from "sparql-http-client/ParsingClient";

export type GraphqlRequestContext = {
  sunshineDataService: SunshineDataService;
  sparqlClient: ParsingClient;
};

export const context = async (
  req: NextApiRequest
): Promise<GraphqlRequestContext> => {
  const sunshineDataService = getSunshineDataServiceFromApiRequest(req);
  const sparqlClient = await getSparqlClientFromApiRequest(req);

  return {
    sunshineDataService,
    sparqlClient,
  };
};
