import { MiddlewareConfig, NextMiddleware, NextRequest } from "next/server";

import createAdminMiddleware from "src/middlewares/admin";
import createBasicAuthMiddleware from "src/middlewares/basic-auth";
import { chain } from "src/middlewares/chain";

const basicAuthMiddleware = createBasicAuthMiddleware();

const publicMiddleware = chain([basicAuthMiddleware]);
const protectedMiddleware = chain([
  basicAuthMiddleware,
  createAdminMiddleware({ redirectOnFail: true }),
]);
const protectedApiMiddleware = chain([
  basicAuthMiddleware,
  createAdminMiddleware({ redirectOnFail: false }),
]);

/**
 * Middleware to protect admin routes.
 *
 * - Protects all /admin/* HTML pages (requires valid JWT session)
 * - Excludes /admin/login (public login page)
 * - Excludes /admin/session-config (handles its own auth in getServerSideProps)
 * - Redirects to /admin/login with return_to param if no valid session
 * - API routes (/api/admin/*) are protected separately using dual auth
 * - All non-admin routes use nextAuthMiddleware (basic auth)
 */
const middleware: NextMiddleware = (request: NextRequest, ev) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login") {
      // Allow access to login API (public)
      return publicMiddleware(request, ev);
    }
    return protectedApiMiddleware(request, ev);
  }
  // Non-admin routes use basic auth middleware (for ref/int environments)
  else if (pathname.startsWith("/admin")) {
    // Allow access to login page (public)
    if (pathname === "/admin/login") {
      return publicMiddleware(request, ev);
    } else {
      return protectedMiddleware(request, ev);
    }
  } else {
    return publicMiddleware(request, ev);
  }
};

export default middleware;

export const config: MiddlewareConfig = {};
