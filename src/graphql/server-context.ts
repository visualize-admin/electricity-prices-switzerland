import { NextApiRequest } from "next";
import { SunshineDataService } from "src/lib/sunshine-data-service";
import { getSunshineDataServiceFromApiRequest } from "src/lib/sunshine-data-service-context";

export type GraphqlRequestContext = {
  sunshineDataService: SunshineDataService;
};

export const context = async (
  req: NextApiRequest
): Promise<GraphqlRequestContext> => {
  const sunshineDataService = getSunshineDataServiceFromApiRequest(req);

  return {
    sunshineDataService,
  };
};
