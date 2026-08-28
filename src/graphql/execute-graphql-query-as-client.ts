import { DocumentNode } from "graphql";
import { Client } from "urql";

import { ExecuteGraphqlQuery } from "src/utils/execute-graphql-query";

/**
 * Wraps an `ExecuteGraphqlQuery` (server-side, executes directly against the
 * Apollo Server instance; throws on error) in the minimal urql `Client`
 * shape the report modules under `src/domain/*-report.ts` call
 * (`client.query(doc, vars).toPromise()` returning `{ data } | { error }`).
 * Lets those modules run unchanged both in the CLI (a real urql `Client`
 * over HTTP, see `src/graphql/node-client.ts`) and in an admin API route (an
 * in-process Apollo Server call, see `src/pages/admin/api-status.tsx`'s use
 * of `createExecuteGraphqlQuery`).
 */
export function executeGraphqlQueryAsClient(
  executeGraphqlQuery: ExecuteGraphqlQuery
): Client {
  return {
    query: (doc: DocumentNode, variables?: Record<string, unknown>) => ({
      toPromise: async () => {
        try {
          const data = await executeGraphqlQuery(doc, variables);
          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
  } as unknown as Client;
}
