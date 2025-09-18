/**
 * CSRF token generation and validation for forms.
 */
export function generateCSRFToken(): string {
  return `csrf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
/**
 * Validates CSRF token (basic implementation).
 * In a production environment, you might want to store tokens server-side
 * and implement more sophisticated validation.
 */

export function validateCSRFToken(token: string, timestamp?: number): boolean {
  if (!token.startsWith("csrf_")) return false;

  const parts = token.split("_");
  if (parts.length !== 3) return false;

  const tokenTimestamp = parseInt(parts[1], 10);
  if (isNaN(tokenTimestamp)) return false;

  // Token should not be older than 1 hour
  const maxAge = 3600 * 1000; // 1 hour in milliseconds
  const now = timestamp || Date.now();

  return now - tokenTimestamp <= maxAge;
}
