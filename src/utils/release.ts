import { execSync } from "child_process";
import os from "os";

/**
 * Resolves the release name for metrics isolation. Used by Sentry.
 *
 * - In Vercel: uses VERCEL_GIT_COMMIT_REF to get the name of the branch
 * - Locally: uses format `local-{hostname}-{git-branch}`
 *
 * This keeps metrics isolated per branch during local development
 * while allowing metrics to accumulate across multiple test runs
 * on the same branch.
 */
export function getReleaseName(): string {
  // Use Vercel deployment ID if available
  if (process.env.VERCEL_GIT_COMMIT_REF) {
    return `vercel-${process.env.VERCEL_GIT_COMMIT_REF ?? "unknown"}`;
  }

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

    // Sanitize branch name
    return branch.replace(/[^a-zA-Z0-9-_]/g, "-");
  } catch (error) {
    console.warn("Failed to get git branch, using 'unknown':", error);
    return "unknown";
  }
}
