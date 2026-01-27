import { NextResponse } from "next/server";

import { parseSessionFromRequest } from "src/admin-auth";
import server from "src/env/server";
import { CustomMiddleware, MiddlewareFactory } from "src/middlewares/chain";

// Check API token Bearer against ADMIN_API_TOKEN env variable
function checkApiToken(request: Request): boolean {
  const apiToken = server.ADMIN_API_TOKEN;
  if (!apiToken) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice("Bearer ".length);
  return token === apiToken;
}

const createAdminMiddleware: (options: {
  redirectOnFail: boolean;
}) => MiddlewareFactory = (options) => (middleware: CustomMiddleware) => {
  return async (request, event) => {
    const { pathname } = request.nextUrl;
    // Check for valid admin session
    const session = await parseSessionFromRequest(request);
    const apiTokenValid = checkApiToken(request);

    if (!session && !apiTokenValid) {
      // No valid session - redirect to login with return_to param
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("return_to", pathname);
      if (!options.redirectOnFail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      } else {
        return NextResponse.redirect(loginUrl);
      }
    }

    // Valid session - allow request
    return middleware(request, event);
  };
};

export default createAdminMiddleware;
