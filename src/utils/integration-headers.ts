/**
 * Returns HTTP headers for authenticating against a protected deployment.
 * Supports both BASIC_AUTH_CREDENTIALS and VERCEL_AUTOMATION_BYPASS_SECRET.
 */
export const makeDeploymentAuthHeaders = () => ({
  ...(process.env.BASIC_AUTH_CREDENTIALS
    ? {
        authorization: `Basic ${Buffer.from(
          process.env.BASIC_AUTH_CREDENTIALS,
        ).toString("base64")}`,
      }
    : {}),
  ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
    ? {
        "x-vercel-protection-bypass":
          process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
      }
    : {}),
});
