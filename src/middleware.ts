import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { createNextAuthMiddleware } from "nextjs-basic-auth-middleware";

import { parseSessionFromRequest } from "src/admin-auth/session";

const nextAuthMiddleware = createNextAuthMiddleware({});

const adminMiddleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  // Check for valid admin session
  const session = await parseSessionFromRequest(request);

  if (!session) {
    // No valid session - redirect to login with return_to param
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("return_to", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Valid session - allow request
  return NextResponse.next();
};

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
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Non-admin routes use basic auth middleware (for ref/int environments)
  if (!pathname.startsWith("/admin")) {
    return nextAuthMiddleware(request);
  }

  // Allow access to login page (public)
  if (pathname === "/admin/login") {
    return nextAuthMiddleware(request);
  }

  return adminMiddleware(request);
}

export const config: MiddlewareConfig = {
  matcher: ["/(.*)"],
};
