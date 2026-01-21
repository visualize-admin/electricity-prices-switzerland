import { NextApiRequest, NextApiResponse } from "next";

import { setSessionCookie, clearSessionCookie } from "src/admin-auth/cookie";
import { validateCSRFToken } from "src/admin-auth/crsf";
import { SessionConfigFlags } from "src/admin-auth/flags";
import {
  createSessionToken,
  parseSessionFromRequest,
  updateSessionFlags,
} from "src/admin-auth/session";

interface UpdateFlagsRequest {
  flags: Partial<SessionConfigFlags>;
  csrfToken: string;
  logout?: string;
}

const REDIRECT_URL = "/admin/session-config";

function redirect(
  res: NextApiResponse,
  params: { success?: boolean; message?: string; error?: string }
) {
  const searchParams = new URLSearchParams();
  if (params.success !== undefined)
    searchParams.set("success", String(params.success));
  if (params.message) searchParams.set("message", params.message);
  if (params.error) searchParams.set("error", params.error);

  const query = searchParams.toString();
  return res.redirect(303, query ? `${REDIRECT_URL}?${query}` : REDIRECT_URL);
}

interface UpdateFlagsRequest {
  flags: Partial<SessionConfigFlags>;
  csrfToken: string;
}

type SessionConfigPostPayload = UpdateFlagsRequest & { logout?: string };

const parseBodyIntoSessionConfigPostPayload = (
  body: NextApiRequest["body"]
): SessionConfigPostPayload => {
  const res = {
    flags: {} as Record<string, unknown>,
    csrfToken: "",
    logout: "",
  };
  for (const key in body) {
    if (key.startsWith("flags.")) {
      const flagKey = key.slice("flags.".length); // Remove 'flags.' prefix
      res.flags[flagKey] = body[key];
    }
    if (key === "csrfToken") {
      res.csrfToken = body[key];
    }
    if (key === "logout") {
      res.logout = body[key];
    }
  }
  return res;
};

/**
 * POST /api/admin/session-config
 *
 * Handles session config flag updates and logout.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return redirect(res, { error: "Method not allowed" });
  }

  // Get session
  const session = await parseSessionFromRequest(req);

  if (!session) {
    return res.redirect(303, "/admin/login");
  }

  const { flags, csrfToken, logout }: UpdateFlagsRequest =
    parseBodyIntoSessionConfigPostPayload(req.body);

  // Handle logout
  if (logout === "true") {
    clearSessionCookie(res);
    return res.redirect(303, "/admin/login");
  }

  // Validate CSRF token with session binding
  if (!csrfToken || !validateCSRFToken(csrfToken, session.sessionId)) {
    return redirect(res, {
      error: "Invalid or expired form. Please try again.",
    });
  }

  try {
    // Validate and update flags
    const updatedFlags = await updateSessionFlags(session, flags);
    const updatedToken = await createSessionToken(updatedFlags);
    setSessionCookie(res, updatedToken);

    return redirect(res, {
      success: true,
      message: "Flags updated successfully.",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update flags";
    return redirect(res, { error: errorMessage });
  }
}
