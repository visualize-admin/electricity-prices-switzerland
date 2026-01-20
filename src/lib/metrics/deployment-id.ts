import os from "os";
import { execSync } from "child_process";

/**
 * Resolves the deployment ID for metrics isolation.
 *
 * - In Vercel: uses VERCEL_DEPLOYMENT_ID
 * - Locally: uses format `local-{hostname}-{git-branch}`
 *
 * This keeps metrics isolated per branch during local development
 * while allowing metrics to accumulate across multiple test runs
 * on the same branch.
 */
export function getDeploymentId(): string {
  // Use Vercel deployment ID if available
  if (process.env.VERCEL_DEPLOYMENT_ID) {
    return process.env.VERCEL_DEPLOYMENT_ID;
  }

  // Generate local deployment ID
  const hostname = os.hostname().split(".")[0]; // Take first part of hostname
  const gitBranch = getGitBranch();

  return `local-${hostname}-${gitBranch}`;
}

/**
 * Gets the current git branch name, sanitized for use in keys
 */
function getGitBranch(): string {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    // Sanitize branch name for use in Redis keys
    return branch.replace(/[^a-zA-Z0-9-_]/g, "-");
  } catch (error) {
    console.warn("[Metrics] Failed to get git branch, using 'unknown':", error);
    return "unknown";
  }
}
