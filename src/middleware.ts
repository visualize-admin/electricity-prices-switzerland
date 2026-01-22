import { MiddlewareConfig, NextMiddleware, NextRequest } from "next/server";

import { withAdminMiddleware } from "src/utils/admin-middleware";
import withBasicAuthMiddleware from "src/utils/basic-auth-middleware";
import { chain } from "src/utils/middleware-chain";

const publicMiddleware = chain([withBasicAuthMiddleware]);
const protectedMiddleware = chain([
  withBasicAuthMiddleware,
  withAdminMiddleware({ redirectOnFail: true }),
]);
const protectedApiMiddleware = chain([
  withBasicAuthMiddleware,
  withAdminMiddleware({ redirectOnFail: false }),
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

export const config: MiddlewareConfig = {
  matcher: ["/(.*)"],
};
