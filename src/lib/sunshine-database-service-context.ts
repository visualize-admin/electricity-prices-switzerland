import { GetServerSidePropsContext, NextApiRequest } from "next";

import { databaseService as sqlDatabaseService } from "src/lib/db/sql";
import { DatabaseService } from "src/lib/sunshine-database-service";

const DATABASE_SERVICE_MAP: Record<string, DatabaseService> = {
  sql: sqlDatabaseService,
};

const DEFAULT_DATABASE_SERVICE_KEY = "sql";

export function getDatabaseService(serviceKey: string): DatabaseService {
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

export function getDatabaseServiceFromHeaders(
  headers: NextApiRequest["headers"]
): DatabaseService {
  const serviceKey = headers["x-database-service"] as string;
  return getDatabaseService(serviceKey);
}

export function getDatabaseServiceFromGetServerSidePropsContext(
  context: GetServerSidePropsContext
): DatabaseService {
  return getDatabaseServiceFromHeaders(context.req.headers);
}
