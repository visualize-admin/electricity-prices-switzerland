import { NextApiRequest, NextApiResponse } from "next";

import { clearSessionCookie } from "src/admin-auth/cookie";
import { validateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";

/**
 * POST /api/admin/logout
 *
 * Handles admin logout by clearing the session cookie.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get session
  const session = await parseSessionFromRequest(req);

  if (!session) {
    return res.redirect(303, "/admin/login");
  }

  // Validate CSRF token
  const csrfToken = req.body.csrfToken;
  if (!csrfToken || !validateCSRFToken(csrfToken, session.sessionId)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  // Clear session cookie and redirect to login
  clearSessionCookie(res);
  return res.redirect(303, "/admin/login");
}
