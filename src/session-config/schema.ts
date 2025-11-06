import z from "zod";

import server from "src/env/server";

/**
 * Schema for session config flags.
 * This schema defines all configurable session flags that affect the
 * application's behavior and can be modified at runtime through the session config interface.
 */

export const sessionConfigFlagsSchema = z.object({
  /**
   * Controls which data service implementation to use for Sunshine data.
   * - "sparql": Use SPARQL endpoint queries (default)
   * - "sql": Use local SQL database queries
   */
  sunshineDataService: z
    .enum(["sql", "sparql"])
    .default(server.SUNSHINE_DEFAULT_SERVICE)
    .describe("Data service implementation for Sunshine data (SPARQL or SQL)"),

  /**
   * Configures the SPARQL endpoint URL for querying RDF data.
   * This allows switching between different SPARQL endpoints at runtime.
   */
  sparqlEndpoint: z
    .string()
    .url()
    .default(server.SPARQL_ENDPOINT)
    .describe("SPARQL endpoint URL for querying RDF data"),
});
