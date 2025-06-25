import { z } from "zod";

export const buildSchema = z.object({
  // Used to display a mention of the current deployment in development mode
  DEPLOYMENT: z.string().optional(),
  CURRENT_PERIOD: z.string().default("2025"),
  FIRST_PERIOD: z.string().default("2009"),
  VERSION: z.string().optional(),
  ALLOW_ENGLISH: z.boolean().default(false),
});

// Define the schema for server-side variables
export const serverSchema = z.object({
  // Gever document download
  EIAM_CERTIFICATE_CONTENT: z.string().optional(),
  EIAM_CERTIFICATE_PASSWORD: z.string().optional(),
  EIAM_CERTIFICATE_PATH: z.string().optional(),

  GEVER_BINDING_IPSTS: z
    .string()
    .default(
      "https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport"
    ),

  PREVIEW_PASSWORD: z.string().optional(),

  GEVER_BINDING_RPSTS: z
    .string()
    .default(
      "https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256"
    ),
  GEVER_BINDING_SERVICE: z
    .string()
    .default(
      "https://api-bv.egov-abn.uvek.admin.ch/BusinessManagement/GeverService/GeverServiceAdvanced.svc"
    ),
  DEBUG_DOWNLOAD_SECRET: z
    .string()
    .default("GqQF$t$Fm^oddinivkY8TT8F^kRuRUJ$NJ5Jt%vQ"),

  ELCOM_ENV: z.string().optional(),

  // Gitlab as CMS
  GITLAB_WIKI_TOKEN: z.string().optional(),
  GITLAB_WIKI_URL: z.string().optional(),

  // Tracking
  MATOMO_ID: z.string().optional(),

  // Apollo plugin
  METRICS_PLUGIN_ENABLED: z.string().optional(),

  NODE_ENV: z.string().default("development"),

  // Sparql
  SPARQL_EDITOR: z.string().optional(),
  SPARQL_ENDPOINT: z.string().default("https://test.lindas.admin.ch/query"),

  /**
   * Whether the SPARQL endpoint supports caching per cube.
   *
   * When this is set to true, the cubeIri is appended to the URL of the SPARQL
   * endpoint.
   * The "cube" endpoints' cache is only flushed when the cube is updated, whereas
   * the "global" endpoint's cache is flushed when any cube is updated.
   */
  SPARQL_ENDPOINT_SUPPORTS_CACHING_PER_CUBE: z
    .string()
    .optional()
    .default("false")
    .transform((value) => value === "true"),
});
