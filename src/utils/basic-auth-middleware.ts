import { NextResponse } from "next/server";

import {
  CustomMiddleware,
  MiddlewareFactory,
} from "src/utils/middleware-chain";

/**
 * If BASIC_AUTH_CREDENTIALS env variable is set, it checks the incoming request to see if matches.
 * BASIC_AUTH_CREDENTIALS is expected to be in the format "username:password".
 *
 * If ADMIN_API_TOKEN is present and the request uses Bearer auth with that token,
 * basic auth is bypassed completely.
 */
const withBasicAuthMiddleware: MiddlewareFactory =
  (middleware: CustomMiddleware) => async (request, event) => {
    const basicAuthCredentials = process.env.BASIC_AUTH_CREDENTIALS;
    if (!basicAuthCredentials) {
      // No basic auth configured, allow all requests
      return middleware(request, event);
    }

    const authHeader = request.headers.get("authorization");

    // Check if this is a Bearer token with ADMIN_API_TOKEN - bypass basic auth
    const adminApiToken = process.env.ADMIN_API_TOKEN;
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
          "WWW-Authenticate": 'Basic realm="Restricted Area"',
        },
      });
    }

    const base64Credentials = authHeader.slice("Basic ".length);
    const decodedCredentials = Buffer.from(
      base64Credentials,
      "base64"
    ).toString("utf-8");

    if (decodedCredentials !== basicAuthCredentials) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Restricted Area"',
        },
      });
    }

    // Credentials are valid, allow the request
    return middleware(request, event);
  };

export default withBasicAuthMiddleware;
