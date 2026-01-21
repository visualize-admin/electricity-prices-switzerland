import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import { z } from "zod";

import serverEnv from "src/env/server";

const CsrfTokenPayload = z.object({
  nonce: z.string(),
  timestamp: z.number(),
  sessionId: z.string().optional(),
});
/**
 * CSRF token payload structure
 */
type CsrfTokenPayload = z.infer<typeof CsrfTokenPayload>;

/**
 * Maximum age for CSRF tokens in milliseconds (1 hour)
 */
const CSRF_TOKEN_MAX_AGE = 3600 * 1000;

/**
 * Allowed clock skew in milliseconds when validating timestamps
 */
const MAX_CLOCK_SKEW_MS = 5000; // 5 seconds

/**
 * Generates a cryptographically secure CSRF token.
 * The token is signed using HMAC-SHA256 with ADMIN_JWT_SECRET.
 *
 * @param sessionId Optional session ID to bind the token to a specific session
 * @returns Base64url-encoded signed CSRF token
 */
export function generateCSRFToken(sessionId?: string): string {
  // Generate cryptographically secure random nonce
  const nonce = randomBytes(16).toString("base64url");

  const payload: CsrfTokenPayload = {
    nonce,
    timestamp: Date.now(),
    sessionId,
  };

  // Create payload string
  const payloadString = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadString).toString("base64url");

  const secret = serverEnv.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_JWT_SECRET is not set, cannot produce login page"
    );
  }

  // Sign the payload using HMAC-SHA256
  const signature = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  // Return token in format: payload.signature
  return `${payloadB64}.${signature}`;
}

/**
 * Validates and verifies a CSRF token.
 * Uses constant-time comparison to prevent timing attacks.
 *
 * @param token The CSRF token to validate
 * @param sessionId Optional session ID to verify token binding
 * @param currentTimestamp Optional timestamp for testing purposes
 * @returns true if token is valid, false otherwise
 */
export function validateCSRFToken(
  token: string,
  sessionId?: string,
  currentTimestamp?: number
): boolean {
  try {
    // Split token into payload and signature
    const parts = token.split(".");
    if (parts.length !== 2) {
      return false;
    }

    const [payloadB64, providedSignature] = parts;

    const secret = serverEnv.ADMIN_JWT_SECRET;
    if (!secret) {
      return false;
    }

    // Verify signature using HMAC-SHA256
    const expectedSignature = createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    // Use constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(providedSignature);

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
      return false;
    }

    // Decode and parse payload
    const payloadString = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payloadResp = CsrfTokenPayload.safeParse(JSON.parse(payloadString));
    if (!payloadResp.success) {
      return false;
    }
    const payload = payloadResp.data;

    // Validate timestamp
    const now = currentTimestamp || Date.now();
    if (now - payload.timestamp > CSRF_TOKEN_MAX_AGE) {
      return false;
    }

    // Validate timestamp is not in the future (allow 5 second clock skew)
    if (payload.timestamp > now + MAX_CLOCK_SKEW_MS) {
      return false;
    }

    // If sessionId is provided, verify it matches the token's sessionId
    if (sessionId && payload.sessionId && payload.sessionId !== sessionId) {
      return false;
    }

    return true;
  } catch {
    // Any error in parsing or validation should result in rejection
    return false;
  }
}
