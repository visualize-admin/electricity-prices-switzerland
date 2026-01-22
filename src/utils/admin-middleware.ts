import { NextResponse } from "next/server";

import { parseSessionFromRequest } from "src/admin-auth";
import {
  CustomMiddleware,
  MiddlewareFactory,
} from "src/utils/middleware-chain";

export const withAdminMiddleware: (options: {
  redirectOnFail: boolean;
}) => MiddlewareFactory = (options) => (middleware: CustomMiddleware) => {
  return async (request, event) => {
    const { pathname } = request.nextUrl;
    // Check for valid admin session
    const session = await parseSessionFromRequest(request);

    if (!session) {
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
