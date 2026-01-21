import { NextApiRequest, NextApiResponse } from "next";

import { setSessionCookie } from "src/admin-auth/cookie";
import { validateCSRFToken } from "src/admin-auth/crsf";
import { defaultSessionConfigFlags } from "src/admin-auth/flags";
import { checkRateLimit, clearRateLimit } from "src/admin-auth/rate-limit";
import { validatePassword, createSessionToken } from "src/admin-auth/session";

interface LoginRequest {
  password: string;
  csrfToken: string;
}

/**
 * POST /api/admin/login
 *
 * Handles login authentication and creates session cookie.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check rate limiting
  if (!checkRateLimit(req)) {
    return res.status(429).json({
      error: "Too many login attempts. Please try again in 15 minutes.",
    });
  }

  const { password, csrfToken }: LoginRequest = req.body;

  // Validate CSRF token
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    return res.status(400).json({
      error: "Invalid or expired form. Please try again.",
    });
  }

  // Validate password
  if (!password || !validatePassword(password)) {
    return res.status(401).json({
      error: "Invalid password. Please try again.",
    });
  }

  // Clear rate limit on successful login
  clearRateLimit(req);

  // Create session token with default flags
  const token = await createSessionToken(defaultSessionConfigFlags);
  setSessionCookie(res, token);

  // Return success with redirect URL
  const returnTo =
    (Array.isArray(req.query.return_to)
      ? req.query.return_to[0]
      : req.query.return_to) || "/admin/session-config";

  return res.status(200).json({
    success: true,
    redirectTo: returnTo,
  });
}
