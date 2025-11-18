import { exec } from "child_process";
import * as fs from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

interface Issue {
  number: string;
  content: string;
}

function log(message: string): void {
  console.error(message);
}

async function getCommitMessages(): Promise<string[]> {
  log("Fetching commit messages...");
  const { stdout } = await execAsync("git log --format=%B main...head");
  log(`Retrieved ${stdout.split("\n").length} commit messages`);
  return stdout.split("\n");
}

function extractIssueNumbers(text: string): string[] {
  const matches = text.match(/#\d+/g) || [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}

async function downloadIssueContent(issueNumber: string): Promise<string> {
  try {
    log(`Downloading issue #${issueNumber}...`);
    const { stdout } = await execAsync(
      `gh issue view ${issueNumber} --json title,body`
    );
    log(`Successfully fetched issue #${issueNumber}`);
    return stdout;
  } catch (error) {
    log(`Failed to fetch issue #${issueNumber}`);
    return "";
  }
}

async function getPRTemplate(): Promise<string> {
  log("Looking for PR template...");
  const templatePaths = [
    ".github/pull_request_template.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    "pull_request_template.md",
  ];

  for (const templatePath of templatePaths) {
    if (fs.existsSync(templatePath)) {
      log(`Found PR template at ${templatePath}`);
      return fs.readFileSync(templatePath, "utf-8");
    }
  }
  log("No PR template found");
  return "";
}

async function prepareContext(): Promise<string> {
  log("Starting context preparation...");
  const commits = await getCommitMessages();
  const issueNumbers = new Set<string>();

  commits.forEach((commit) => {
    extractIssueNumbers(commit).forEach((num) => issueNumbers.add(num));
  });

  log(`Found ${issueNumbers.size} unique issue(s)`);

  const issues: Issue[] = [];
  for (const num of issueNumbers) {
    const content = await downloadIssueContent(num);
    if (content) {
      issues.push({ number: num, content });
    }
  }

  log(`Successfully loaded ${issues.length} issue(s)`);

  const prTemplate = await getPRTemplate();

  const context = `You are preparing a PR description for an LLM.

Based on the PR template and related issues above, prepare a comprehensive PR description. 
Use the reproduction steps, expected behavior, and actual behavior from the issues to inform the description.
Ensure clarity and completeness. Do not execute any code or commands, only reformat the current content into a PR description.
Every issue should be referenced in the description, and reproduction steps should be included for every issue that has them.

<pr_template>
${prTemplate}
</pr_template>

<issues>
${issues
  .map(
    (issue) => `<issue number="${issue.number}">\n${issue.content}\n</issue>`
  )
  .join("\n")}
</issues>
`;

  log("Context preparation completed");
  return context;
}

prepareContext()
  .then((context) => {
    console.log(context);
  })
  .catch((error) => {
    log("Error preparing context: " + error);
    process.exit(1);
  });
