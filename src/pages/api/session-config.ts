import { NextApiRequest, NextApiResponse } from "next";

import {
  renderDashboard,
  renderLoginForm,
  renderErrorPage,
} from "src/session-config/components/render";
import {
  setSessionCookie,
  clearSessionCookie,
} from "src/session-config/cookie";
import { generateCSRFToken, validateCSRFToken } from "src/session-config/crsf";
import {
  SessionConfigFlags,
  defaultSessionConfigFlags,
} from "src/session-config/flags";
import { checkRateLimit, clearRateLimit } from "src/session-config/rate-limit";
import {
  validatePassword,
  createSessionToken,
  parseSessionFromRequest,
  updateSessionFlags,
  SessionError,
  SessionPayload,
} from "src/session-config/session";

interface LoginRequest {
  password: string;
  csrfToken: string;
}

interface UpdateFlagsRequest {
  flags: Partial<SessionConfigFlags>;
  csrfToken: string;
}

/**
 * Session config API endpoint.
 *
 * GET: Returns session config dashboard with current flags or login form
 * POST: Handles authentication and flag updates
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      return await handleGetRequest(req, res);
    } else if (req.method === "POST") {
      return await handlePostRequest(req, res);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Session Config API error:", error);

    if (error instanceof SessionError) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Handles GET requests - shows session config dashboard or login form.
 */
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const session = await parseSessionFromRequest(req);
  const csrfToken = generateCSRFToken();

  if (session) {
    // User is authenticated, show session config dashboard
    const html = renderDashboard(session.flags, csrfToken);
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } else {
    // User not authenticated, show login form
    const html = renderLoginForm(csrfToken);
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  }
}

/**
 * Handles POST requests - authentication and flag updates.
 */
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const session = await parseSessionFromRequest(req);

  if (!session) {
    // Handle login attempt
    return await handleLoginRequest(req, res);
  } else {
    // Handle flag update
    return await handleFlagUpdateRequest(req, res, session);
  }
}

/**
 * Handles login requests.
 */
async function handleLoginRequest(req: NextApiRequest, res: NextApiResponse) {
  // Check rate limiting
  if (!checkRateLimit(req)) {
    const html = renderErrorPage(
      "Too many login attempts. Please try again in 15 minutes."
    );
    res.setHeader("Content-Type", "text/html");
    return res.status(429).send(html);
  }

  const { password, csrfToken }: LoginRequest = req.body;

  // Validate CSRF token
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    const html = renderErrorPage("Invalid or expired form. Please try again.");
    res.setHeader("Content-Type", "text/html");
    return res.status(400).send(html);
  }

  // Validate password
  if (!password || !validatePassword(password)) {
    const newCsrfToken = generateCSRFToken();
    const html = renderLoginForm(
      newCsrfToken,
      "Invalid password. Please try again."
    );
    res.setHeader("Content-Type", "text/html");
    return res.status(401).send(html);
  }

  // Clear rate limit on successful login
  clearRateLimit(req);

  // Create session token with default flags
  const token = await createSessionToken(defaultSessionConfigFlags);
  setSessionCookie(res, token);

  // Redirect to session config dashboard
  res.writeHead(302, { Location: "/api/session-config" });
  return res.end();
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
 * Handles flag update requests.
 */
async function handleFlagUpdateRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  session: SessionPayload
) {
  const { flags, csrfToken, logout } = parseBodyIntoSessionConfigPostPayload(
    req.body
  );

  // Handle logout
  if (logout === "true") {
    clearSessionCookie(res);
    res.writeHead(302, { Location: "/api/session-config" });
    return res.end();
  }

  // Validate CSRF token
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    const newCsrfToken = generateCSRFToken();
    const html = renderDashboard(session.flags, newCsrfToken, {
      error: "Invalid or expired form. Please try again.",
    });
    res.setHeader("Content-Type", "text/html");
    res.status(400).send(html);
  }

  try {
    // Validate and update flags
    const updatedFlags = await updateSessionFlags(session, flags);
    const updatedToken = await createSessionToken(updatedFlags);
    setSessionCookie(res, updatedToken);
    const html = renderDashboard(updatedFlags, generateCSRFToken(), {
      message: 'Flags updated successfully. <a href="/">Go to home page</a>.',
    });
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    const newCsrfToken = generateCSRFToken();
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update flags";
    const html = renderDashboard(session.flags, newCsrfToken, {
      error: errorMessage,
    });
    res.setHeader("Content-Type", "text/html");
    res.status(400).send(html);
  }
}
