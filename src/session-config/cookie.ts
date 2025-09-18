import { NextApiResponse } from "next";

import { getSessionDuration } from "src/session-config/session";

/**
 * Cookie configuration for secure session management.
 */
const COOKIE_NAME = "admin_session";

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
  path?: string;
}

function getCookieOptions(maxAge?: number): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: maxAge || getSessionDuration(),
    path: "/",
  };
}
export const getCookieValue = (token: string, maxAge?: number) => {
  const options = getCookieOptions(maxAge);

  const cookieValue = `${COOKIE_NAME}=${token}; HttpOnly; SameSite=${
    options.sameSite
  }; Path=${options.path}; Max-Age=${options.maxAge}${
    options.secure ? "; Secure" : ""
  }`;
  return cookieValue;
};

export async function createCookieFromFlags(
  flags: Partial<SessionConfigFlags>
) {
  const token = await createSessionToken(flags);
  return getCookieValue(token);
}

/**
 * Sets a session cookie with the JWT token.
 */
export function setSessionCookie(res: NextApiResponse, token: string): void {
  const cookieValue = getCookieValue(token);
  res.setHeader("Set-Cookie", cookieValue);
}

/**
 * Clears the session cookie.
 */
export function clearSessionCookie(res: NextApiResponse): void {
  const cookieValue = getCookieValue("", 0); // Set maxAge to 0 to delete
  res.setHeader("Set-Cookie", cookieValue);
}

/**
 * Extracts the session token from request cookies.
 */
export function getSessionTokenFromCookies(
  cookies: string | undefined
): string | null {
  if (!cookies) return null;

  const cookiePairs = cookies.split(";").map((c) => c.trim());
  for (const pair of cookiePairs) {
    const [name, value] = pair.split("=");
    if (name === COOKIE_NAME) {
      return value || null;
    }
  }

  return null;
}
