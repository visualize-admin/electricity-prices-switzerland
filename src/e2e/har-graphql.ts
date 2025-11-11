import { createHash } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";

interface HarEntry {
  request: {
    url: string;
    postData?: {
      text: string;
    };
  };
  response: {
    content: {
      text: string;
    };
  };
}

interface HarFile {
  log: {
    entries: HarEntry[];
  };
}

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

interface GraphQLResponse {
  data?: unknown;
  errors?: unknown[];
}

interface SavedGraphQLRequest {
  timestamp: string;
  operationName: string;
  request: {
    query: string;
    variables: Record<string, unknown>;
  };
  response: GraphQLResponse;
}

export interface ParseResult {
  totalEntries: number;
  savedRequests: number;
  operationNames: string[];
  outputDir: string;
}

/**
 * Generates a consistent hash for a GraphQL request, matching the plugin's algorithm
 */
function generateRequestHash(
  query: string,
  variables: Record<string, unknown>
): string {
  return createHash("sha256")
    .update(JSON.stringify({ query, variables }))
    .digest("hex")
    .substring(0, 16); // Use first 16 characters for shorter filenames
}

/**
 * Ensures the output directory exists
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

const softJSONParse = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

/**
 * Reads and parses a HAR file
 */
export async function readHarFile(harFilePath: string): Promise<HarFile> {
  const harContent = await fs.readFile(harFilePath, "utf-8");
  const har = softJSONParse<HarFile>(harContent);
  if (!har) {
    throw new Error(`Invalid HAR file format: ${harFilePath}`);
  }
  return har;
}

/**
 * Extracts GraphQL requests from HAR entries
 */
export function extractGraphQLEntries(entries: HarEntry[]): Array<{
  entry: HarEntry;
  request: GraphQLRequest;
  response: GraphQLResponse;
}> {
  const results: Array<{
    entry: HarEntry;
    request: GraphQLRequest;
    response: GraphQLResponse;
  }> = [];

  for (const entry of entries) {
    // Filter for GraphQL requests (URL contains /graphql)
    if (!entry.request.url.includes("/graphql")) {
      continue;
    }

    // Skip if no request body
    if (!entry.request.postData?.text) {
      continue;
    }

    try {
      // Parse GraphQL request
      const graphqlRequest: GraphQLRequest = JSON.parse(
        entry.request.postData.text
      );

      // Skip if no operation name
      if (!graphqlRequest.operationName) {
        console.warn(
          "Skipping GraphQL request without operationName:",
          graphqlRequest.query?.substring(0, 50)
        );
        continue;
      }

      // Parse GraphQL response
      const graphqlResponse = softJSONParse<GraphQLResponse>(
        entry.response.content.text
      );

      if (!graphqlResponse) {
        console.warn(
          `Skipping GraphQL request ${graphqlRequest.operationName} due to invalid response JSON`
        );
        continue;
      }

      results.push({
        entry,
        request: graphqlRequest,
        response: graphqlResponse,
      });
    } catch (error) {
      console.error(
        `Failed to process HAR entry for ${entry.request.url}:`,
        error
      );
    }
  }

  return results;
}

/**
 * Saves a single GraphQL request/response pair to a file
 */
export async function saveGraphQLRequest(
  request: GraphQLRequest,
  response: GraphQLResponse,
  outputDir: string
): Promise<string> {
  await ensureDirectoryExists(outputDir);

  const variables = request.variables || {};
  const requestHash = generateRequestHash(request.query, variables);

  const data: SavedGraphQLRequest = {
    timestamp: new Date().toISOString(),
    operationName: request.operationName!,
    request: {
      query: request.query,
      variables,
    },
    response,
  };

  const filename = `graphql-${request.operationName}-${requestHash}.json`;
  const filepath = join(outputDir, filename);

  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");

  return filename;
}
