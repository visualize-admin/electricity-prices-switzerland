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

  console.log("Using database service:", serviceKey);
  return DATABASE_SERVICE_MAP[serviceKey];
}

const SUNSHINE_DATA_SERVICE_COOKIE_NAME = "sunshine-data-service";

export { SUNSHINE_DATA_SERVICE_COOKIE_NAME };

export function getValidServiceKeys(): string[] {
  return Object.keys(DATABASE_SERVICE_MAP);
}

export function getSunshineDataServiceFromCookies(
  cookies: string | undefined
): string {
  if (!cookies) {
    return DEFAULT_DATABASE_SERVICE_KEY;
  }

  // Parse the cookie string to find our specific cookie
  const cookieArray = cookies.split(";");
  const serviceCookie = cookieArray.find((cookie) =>
    cookie.trim().startsWith(`${SUNSHINE_DATA_SERVICE_COOKIE_NAME}=`)
  );

  if (!serviceCookie) {
    return DEFAULT_DATABASE_SERVICE_KEY;
  }

  const serviceKey = serviceCookie.split("=")[1]?.trim();
  return serviceKey;
}

export function getSunshineDataServiceFromHeaders(
  headers: NextApiRequest["headers"]
): SunshineDataService {
  const serviceKey = headers["x-database-service"] as string;
  return getSunshineDataService(serviceKey);
}

export function getSunshineDataServiceFromApiRequest(
  req: NextApiRequest
): SunshineDataService {
  const serviceKey = getSunshineDataServiceFromCookies(req.headers.cookie);
  return getSunshineDataService(serviceKey);
}

export function getSunshineDataServiceFromGetServerSidePropsContext(
  context: GetServerSidePropsContext
): SunshineDataService {
  const serviceKey = getSunshineDataServiceFromCookies(
    context.req.headers.cookie
  );
  return getSunshineDataService(serviceKey);
}
