#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Automated script to run tests on different branches for metrics comparison.
 *
 * This script:
 * 1. Checks if dev server is running
 * 2. Runs integration tests on specified branches
 * 3. Metrics can be viewed via /admin/metrics across different deployment IDs
 *
 * Usage:
 *   yarn tsx scripts/compare-metrics.ts --branches metrics server-side
 *   yarn tsx scripts/compare-metrics.ts -b metrics server-side
 */

import { execSync } from "child_process";

import { ArgumentParser } from "argparse";

const DEV_SERVER_PORT = 3000;

let originalBranch: string = "";

function saveCurrentBranch(): void {
  try {
    originalBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();
    console.log(`💾 Saved current branch: ${originalBranch}\n`);
  } catch {
    throw new Error("Failed to get current git branch");
  }
}

function switchBranch(branch: string): void {
  try {
    execSync(`git checkout ${branch}`, {
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch (error: $IntentionalAny) {
    const stderr = error.stderr?.toString() || "";
    const stdout = error.stdout?.toString() || "";
    console.error(`Git checkout failed. stdout: ${stdout}, stderr: ${stderr}`);
    throw new Error(
      `Failed to switch to branch: ${branch}. Error: ${
        error.message || stderr || stdout
      }`
    );
  }
}

function checkDevServer(): void {
  try {
    // Check if port is in use
    const result = execSync(`lsof -ti:${DEV_SERVER_PORT}`, {
      encoding: "utf8",
      stdio: "pipe",
    }).trim();

    if (!result) {
      throw new Error("No process found on port");
    }

    console.log(`✅ Dev server is running on port ${DEV_SERVER_PORT}\n`);
  } catch {
    console.error(`❌ Dev server is not running on port ${DEV_SERVER_PORT}`);
    console.error("Please start the dev server first with: yarn dev");
    throw new Error("Dev server is not running");
  }
}

function runTests(): void {
  try {
    execSync("PW_TEST_HTML_REPORT_OPEN='never' yarn test:playwright:app", {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
    });
  } catch {
    // Tests might fail, but we still want to collect metrics
    console.warn("  ⚠ Some integration tests failed, continuing anyway...");
  }
}

function runTestsForBranch(branch: string): void {
  console.log(`  ↳ Switching to branch: ${branch}`);
  switchBranch(branch);

  console.log(`  ↳ Running tests...`);
  runTests();

  console.log(`  ↳ Running tests (second time)...`);
  runTests();

  console.log(`  ✓ Tests completed for ${branch}`);
}

function returnToOriginalBranch(): void {
  if (originalBranch) {
    console.log(`\n↩️  Returning to original branch: ${originalBranch}`);
    switchBranch(originalBranch);
  }
}

async function main() {
  const parser = new ArgumentParser({
    description: "Compare metrics across different branches",
  });

  parser.add_argument("-b", "--branches", {
    nargs: "+",
    required: true,
    help: "List of branches to test (e.g., metrics server-side)",
  });

  const args = parser.parse_args();
  const branches: string[] = args.branches;

  console.log("🚀 Starting test runs for metrics comparison...\n");

  try {
    // Check if dev server is running
    checkDevServer();

    // Save current branch
    saveCurrentBranch();

    // Run tests on each branch
    for (const branch of branches) {
      console.log(`\n📊 Running tests on '${branch}' branch...`);
      runTestsForBranch(branch);
    }

    // Return to original branch
    returnToOriginalBranch();

    console.log("\n✅ Test runs complete!");
    console.log("📊 View metrics comparison at /admin/metrics");
  } catch (error) {
    console.error("\n❌ Error during test runs:", error);

    // Return to original branch on error
    returnToOriginalBranch();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
