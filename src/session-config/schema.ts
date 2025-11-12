import z from "zod";

import server from "src/env/server";

/**
 * Schema for session config flags.
 * This schema defines all configurable session flags that affect the
 * application's behavior and can be modified at runtime through the session config interface.
 */

export const sessionConfigFlagsSchema = z.object({
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
