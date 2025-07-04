import { NextApiRequest } from "next";

import { sunshineDataService as sqlSunshineDataService } from "src/lib/db/sql";
import { SunshineDataService } from "src/lib/sunshine-database-service";

const DATABASE_SERVICE_MAP: Record<string, SunshineDataService> = {
  sql: sqlSunshineDataService,
};

const DEFAULT_DATABASE_SERVICE_KEY = "sql";

function getSunshineDataService(req: NextApiRequest): SunshineDataService {
  const serviceKey = req.headers["x-database-service"] as string;

  if (!serviceKey || !DATABASE_SERVICE_MAP[serviceKey]) {
    console.log(
      "Using default database service:",
      DEFAULT_DATABASE_SERVICE_KEY
    );
    return DATABASE_SERVICE_MAP[DEFAULT_DATABASE_SERVICE_KEY];
  }

  console.log("Using database service:", DEFAULT_DATABASE_SERVICE_KEY);
  return DATABASE_SERVICE_MAP[serviceKey];
}

export type ServerContext = {
  sunshineDataService: SunshineDataService;
};

export const context = async (req: NextApiRequest): Promise<ServerContext> => {
  const sunshineDataService = getSunshineDataService(req);

  return {
    sunshineDataService,
  };
};
