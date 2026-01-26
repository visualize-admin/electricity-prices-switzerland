import { execSync } from "child_process";
import os from "os";

/**
 * Resolves the release name for metrics isolation. Used by Sentry.
 *
 * - In Vercel: uses VERCEL_GIT_COMMIT_REF for branch and VERCEL_GIT_COMMIT_SHA for SHA
 * - Locally: uses format `local-{hostname}-{git-branch}-{git-sha}`
 *
 * This keeps metrics isolated per branch during local development
 * while allowing metrics to accumulate across multiple test runs
 * on the same branch. The SHA helps identify the exact version.
 */
export function getReleaseName(): string {
  // Use Vercel environment variables if available
  if (process.env.VERCEL_GIT_COMMIT_REF) {
    const branch = process.env.VERCEL_GIT_COMMIT_REF ?? "unknown";
    const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? getGitSha();
    return `vercel-${branch}-${sha.substring(0, 7)}`; // Use first 7 chars of SHA
  }

  const hostname = os.hostname().split(".")[0]; // Take first part of hostname
  const gitBranch = getGitBranch();
  const gitSha = getGitSha();

  return `local-${hostname}-${gitBranch}-${gitSha.substring(0, 7)}`;
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

/**
 * Gets the current git commit SHA
 */
function getGitSha(): string {
  try {
    const sha = execSync("git rev-parse HEAD", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    return sha;
  } catch (error) {
    console.warn("Failed to get git SHA, using 'unknown':", error);
    return "unknown";
  }
}
