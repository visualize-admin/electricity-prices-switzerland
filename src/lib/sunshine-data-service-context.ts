import { GetServerSidePropsContext, NextApiRequest } from "next";

import server from "src/env/server";
import { sunshineDataServiceSparql } from "src/lib/db/sparql";
import { sunshineDataServiceSql } from "src/lib/db/sql";
import { SunshineDataService } from "src/lib/sunshine-data-service";

const DATABASE_SERVICE_MAP = {
  sql: sunshineDataServiceSql,
  sparql: sunshineDataServiceSparql,
} satisfies Record<string, SunshineDataService>;

type DatabaseServiceKey = keyof typeof DATABASE_SERVICE_MAP;

const DEFAULT_DATABASE_SERVICE_KEY = server.SUNSHINE_DEFAULT_SERVICE;

export function getSunshineDataService(
  serviceKey: (string & {}) | DatabaseServiceKey
): SunshineDataService {
  if (!serviceKey || !(serviceKey in DATABASE_SERVICE_MAP)) {
    return DATABASE_SERVICE_MAP[DEFAULT_DATABASE_SERVICE_KEY];
  }

  return DATABASE_SERVICE_MAP[serviceKey as DatabaseServiceKey];
}

const SUNSHINE_DATA_SERVICE_COOKIE_NAME = "sunshine-data-service";

export { SUNSHINE_DATA_SERVICE_COOKIE_NAME };

export function getValidServiceKeys(): string[] {
  return Object.keys(DATABASE_SERVICE_MAP);
}

export function getSunshineDataServiceInfo(
  context: GetServerSidePropsContext
): {
  serviceName: string;
  isDefault: boolean;
} {
  const serviceKey = getSunshineDataServiceFromCookies(
    context.req.headers.cookie
  );
  const service = getSunshineDataService(serviceKey);

  return {
    serviceName: service.name,
    isDefault: serviceKey === DEFAULT_DATABASE_SERVICE_KEY,
  };
}

function getSunshineDataServiceFromCookies(
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
