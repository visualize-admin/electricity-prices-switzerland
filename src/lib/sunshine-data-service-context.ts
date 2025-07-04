import { GetServerSidePropsContext, NextApiRequest } from "next";

import { sunshineDataService as sqlSunshineDataService } from "src/lib/db/sql";
import { SunshineDataService } from "src/lib/sunshine-data-service";

const DATABASE_SERVICE_MAP: Record<string, SunshineDataService> = {
  sql: sqlSunshineDataService,
};

const DEFAULT_DATABASE_SERVICE_KEY = "sql";

export function getSunshineDataService(
  serviceKey: string
): SunshineDataService {
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

export function getSunshineDataServiceFromHeaders(
  headers: NextApiRequest["headers"]
): SunshineDataService {
  const serviceKey = headers["x-database-service"] as string;
  return getSunshineDataService(serviceKey);
}

export function getSunshineDataServiceFromGetServerSidePropsContext(
  context: GetServerSidePropsContext
): SunshineDataService {
  return getSunshineDataServiceFromHeaders(context.req.headers);
}
