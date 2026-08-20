import { cacheExchange, createClient, fetchExchange } from "urql";

/**
 * Standalone urql client for use outside React (e.g. CLI scripts), issuing
 * queries against a real GraphQL endpoint with the same generated documents
 * the UI uses. No SSR/suspense exchanges since there's no React tree.
 */
export const createNodeGraphqlClient = (
  endpoint: string,
  headers?: Record<string, string>
) =>
  createClient({
    url: endpoint,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: { headers },
  });
