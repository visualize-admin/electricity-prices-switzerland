import { NextResponse } from "next/server";

import {
  CustomMiddleware,
  MiddlewareFactory,
} from "src/utils/middleware-chain";

const DEFAULT_CREDENTIALS_SEPARATOR = "|";
const DEFAULT_REALM = "Restricted Area";

type Options = {
  realm?: string;
  credentialsSeparator?: string;
};

/**
 * If BASIC_AUTH_CREDENTIALS env variable is set, it checks the incoming request to see if matches.
 * BASIC_AUTH_CREDENTIALS is expected to be in the format "username:password".
 * Multiple credentials can be provided, separated by '|'.
 *
 * If ADMIN_API_TOKEN is present and the request uses Bearer auth with that token,
 * basic auth is bypassed completely.
 */
const withBasicAuthMiddleware: (options?: Options) => MiddlewareFactory =
  (options?: Options) =>
  (middleware: CustomMiddleware) =>
  async (request, event) => {
    const basicAuthCredentialsEnv = process.env.BASIC_AUTH_CREDENTIALS;
    const adminApiToken = process.env.ADMIN_API_TOKEN;
    const {
      realm = DEFAULT_REALM,
      credentialsSeparator = DEFAULT_CREDENTIALS_SEPARATOR,
    } = options ?? {};

    if (!basicAuthCredentialsEnv) {
      // No basic auth configured, allow all requests
      return middleware(request, event);
    }

    const basicAuthCredentials = basicAuthCredentialsEnv
      .trim()
      .split(credentialsSeparator);

    const authHeader = request.headers.get("authorization");

    // Check if this is a Bearer token with adminApiToken - bypass basic auth
    if (adminApiToken && authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length);
      if (token === adminApiToken) {
        // Valid admin API token, bypass basic auth
        return middleware(request, event);
      }
    }

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Basic realm="${realm}"`,
        },
      });
    }

    const base64Credentials = authHeader.slice("Basic ".length);
    const decodedCredentials = Buffer.from(
      base64Credentials,
      "base64"
    ).toString("utf-8");

    if (!basicAuthCredentials.includes(decodedCredentials)) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Basic realm="${realm}"`,
        },
      });
    }

    // Credentials are valid, allow the request
    return middleware(request, event);
  };

export default withBasicAuthMiddleware;
