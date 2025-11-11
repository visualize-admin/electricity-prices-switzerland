import path from "path";

import { z } from "zod";

export const buildSchema = z.object({
  // Used to display a mention of the current deployment in development mode
  VERSION: z.string().optional(),
  ALLOW_ENGLISH: z.boolean().default(false),
});

export type BuildEnv = z.infer<typeof buildSchema>;

// Define the schema for server-side variables
export const serverSchema = z.object({
  // Runtime flags configuration
  FLAGS: z
    .string()
    .optional()
    .transform((flags) => {
      if (!flags) return [];
      try {
        return z.array(z.string()).parse(JSON.parse(flags));
      } catch (error) {
        console.error("Failed to parse FLAGS:", error);
        return [];
      }
    }),

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

  // Apollo plugin
  METRICS_PLUGIN_ENABLED: z.string().optional(),
  SAVE_REQUEST_PLUGIN_ENABLED: z.string().optional().default("false"),
  SAVE_REQUEST_PLUGIN_FOLDER: z.string().optional().default("/tmp"),

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

  SUNSHINE_DEFAULT_SERVICE: z
    .union([z.literal("sparql"), z.literal("sql")])
    .optional()
    .default("sparql"),

  SUNSHINE_ENCRYPTED_DATA_DIR: z
    .string()
    .default(path.join(process.cwd(), "src/sunshine-data")),

  SUNSHINE_CSV_DATA_DIR: z
    .string()
    .default(path.join(process.cwd(), "src/sunshine-data")),

  // Admin session management
  SESSION_CONFIG_PASSWORD: z.string().optional(),
  SESSION_CONFIG_JWT_SECRET: z.string().optional(),
  SESSION_CONFIG_SESSION_DURATION: z
    .string()
    .optional()
    .default("86400")
    .transform((value) => parseInt(value, 10)),
});

const FlagSchema = z.array(z.string());

export const runtimeSchema = z.object({
  PUBLIC_URL: z.string().default(""),
  CURRENT_PERIOD: z.string().default("2025"),
  FIRST_PERIOD: z.string().default("2011"),
  MATOMO_ID: z.string().optional(),
  FLAGS: z
    .string()
    .default("[]")
    .transform((x) => {
      try {
        return FlagSchema.parse(JSON.parse(x));
      } catch {
        return [];
      }
    }),
});

export type RuntimeEnv = z.infer<typeof runtimeSchema>;
