import { randomUUID } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import { NextRequest } from "next/server";
import { z } from "zod";

import serverEnv from "src/env/server";
import {
  getCookieValue,
  getSessionTokenFromCookies,
} from "src/session-config/cookie";

import {
  defaultSessionConfigFlags,
  getDefaultedFlags,
  SessionConfigFlags,
} from "./flags";
import { sessionConfigFlagsSchema } from "./schema";

/**
 * Schema for the JWT payload containing session data.
 */
const sessionPayloadSchema = z.object({
  /** Unique session identifier */
  sessionId: z.string(),
  /** Timestamp when the session was created */
  createdAt: z.number(),
  /** Session config flags configuration */
  flags: sessionConfigFlagsSchema.partial(),
  /** Standard JWT issued at timestamp */
  iat: z.number().optional(),
  /** Standard JWT expiration timestamp */
  exp: z.number().optional(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

/**
 * Session management errors
 */
export class SessionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "SessionError";
  }
}

/**
 * Gets the JWT secret as a Uint8Array for signing operations.
 */
function getJWTSecret(): Uint8Array {
  return new TextEncoder().encode(serverEnv.SESSION_CONFIG_JWT_SECRET);
}

/**
 * Gets the session duration in seconds.
 */
export function getSessionDuration(): number {
  return serverEnv.SESSION_CONFIG_SESSION_DURATION;
}

/**
 * Validates the password.
 */
export function validatePassword(password: string): boolean {
  return password === serverEnv.SESSION_CONFIG_PASSWORD;
}

/**
 * Creates a new JWT session token with the provided flags.
 */
export async function createSessionToken(
  flags: Partial<SessionConfigFlags>
): Promise<string> {
  const secret = getJWTSecret();
  const duration = getSessionDuration();
  const now = Math.floor(Date.now() / 1000);

  const payload: Omit<SessionPayload, "iat" | "exp"> = {
    sessionId: generateSessionId(),
    createdAt: now,
    flags,
  };

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + duration)
    .sign(secret);

  return jwt;
}

/**
 * Verifies and decodes a JWT session token.
 */
async function parseSessionFromJwtToken(
  token: string
): Promise<SessionPayload> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret);

    // Validate the payload structure
    const sessionData = sessionPayloadSchema.parse(payload);
    return sessionData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new SessionError(
        "Invalid session data structure",
        "INVALID_PAYLOAD"
      );
    }
    throw new SessionError("Invalid or expired session token", "INVALID_TOKEN");
  }
}

export async function createCookieFromFlags(
  flags: Partial<SessionConfigFlags>
) {
  const token = await createSessionToken(flags);
  return getCookieValue(token);
}

/**
 * Generates a unique session ID.
 */
function generateSessionId(): string {
  return `sess_${randomUUID()}`;
}

const parseSessionFromCookies = async (
  cookies: string | undefined
): Promise<SessionPayload | null> => {
  const token = getSessionTokenFromCookies(cookies);
  if (!token) return null;

  return parseSessionFromJwtToken(token);
};

/**
 * Validates and extracts session data from request.
 */
export async function parseSessionFromRequest(
  req: NextApiRequest | NextRequest | GetServerSidePropsContext["req"]
): Promise<SessionPayload | null> {
  try {
    const session = await parseSessionFromCookies(
      (req.headers instanceof Headers
        ? req.headers.get("cookie")
        : req.headers.cookie) ?? ""
    );
    return session;
  } catch {
    // Session validation failed, return null to indicate no valid session
    return null;
  }
}

/**
 * Updates session flags and creates a new token.
 */
export async function updateSessionFlags(
  currentSession: SessionPayload,
  newFlags: Partial<SessionConfigFlags>
): Promise<SessionConfigFlags> {
  const updatedFlags = { ...currentSession.flags, ...newFlags };

  // Validate the updated flags
  const validatedFlags = sessionConfigFlagsSchema.parse(updatedFlags);

  // Create new session token with updated flags
  return validatedFlags;
}

export const getSessionConfigFlagsFromCookies = async (
  cookies: string | undefined
) => {
  const session = await parseSessionFromCookies(cookies);
  return session?.flags ?? defaultSessionConfigFlags;
};

/**
 * Gets the current session-config flags from GetServerSideProps context.
 */

export async function getSessionConfigFlagsFromContext(
  context: GetServerSidePropsContext
): Promise<SessionConfigFlags> {
  try {
    const session = await parseSessionFromRequest(
      context.req as NextApiRequest
    );
    return getDefaultedFlags(session?.flags);
  } catch {
    // If session parsing fails, return defaults
    return defaultSessionConfigFlags;
  }
}
