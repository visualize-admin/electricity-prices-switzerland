import { NextApiRequest } from "next";

/**
 * Rate limiting for login attempts (basic implementation by recording the IP).
 * It fails if there are too many attempts that are dispatched to different application
 * instances, since the in-memory map is not shared.
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(req: NextApiRequest): boolean {
  const ip = getClientIP(req);
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const now = Date.now();

  const clientAttempts = loginAttempts.get(ip);

  if (!clientAttempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - clientAttempts.lastAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if max attempts exceeded
  if (clientAttempts.count >= maxAttempts) {
    return false;
  }

  // Increment attempt count
  clientAttempts.count += 1;
  clientAttempts.lastAttempt = now;

  return true;
}
/**
 * Clear rate limit for successful login.
 */

export function clearRateLimit(req: NextApiRequest): void {
  const ip = getClientIP(req);
  loginAttempts.delete(ip);
}
/**
 * Get client IP address from request.
 */

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress || "unknown";

  return ip;
}
