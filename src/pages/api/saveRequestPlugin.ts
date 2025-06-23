import { createHash } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";

import { ApolloServerPlugin } from "@apollo/server";

type SaveRequestInfo = {
  requestBody: string;
  variables: Record<string, unknown>;
  requestHash: string;
  timestamp: string;
};

type SaveRequestOptions = {
  enabled: boolean;
  saveFolder?: string;
};

export const saveRequestPlugin = ({
  enabled,
  saveFolder = "/tmp",
}: SaveRequestOptions): ApolloServerPlugin => {
  if (enabled === false) {
    return {};
  }

  // Ensure the save folder exists
  const ensureFolderExists = async (folderPath: string) => {
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
    }
  };

  // Store request info per request ID
  const requestInfoMap = new Map<string, SaveRequestInfo>();

  return {
    async requestDidStart(requestContext) {
      const requestId =
        requestContext.request.http?.headers.get("x-request-id") ||
        Math.random().toString(36).substring(7);

      return {
        async didResolveOperation() {
          // Capture the request body
          const requestBody = requestContext.request.query || "";
          const variables = requestContext.request.variables || {};

          // Create a hash of the request body for the filename
          const requestHash = createHash("sha256")
            .update(JSON.stringify({ query: requestBody, variables }))
            .digest("hex")
            .substring(0, 16); // Use first 16 characters for shorter filenames

          // Store request info for later use
          requestInfoMap.set(requestId, {
            requestBody,
            variables,
            requestHash,
            timestamp: new Date().toISOString(),
          });
        },

        async willSendResponse() {
          const saveRequestInfo = requestInfoMap.get(requestId);
          if (!saveRequestInfo) {
            return;
          }

          try {
            await ensureFolderExists(saveFolder);

            const responseBody = requestContext.response.body;

            const data = {
              timestamp: saveRequestInfo.timestamp,
              operationName: requestContext.operationName,
              request: {
                query: saveRequestInfo.requestBody,
                variables: saveRequestInfo.variables,
              },
              response: responseBody,
            };

            const filename = `graphql-${saveRequestInfo.requestHash}.json`;
            const filepath = join(saveFolder, filename);

            await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf8");

            console.info(`GraphQL request/response saved to: ${filepath}`);

            // Clean up the request info
            requestInfoMap.delete(requestId);
          } catch (error) {
            console.error("Failed to save GraphQL request/response:", error);
            // Clean up the request info even on error
            requestInfoMap.delete(requestId);
          }
        },
      };
    },
  };
};
