#!/usr/bin/env tsx
/* eslint-disable no-console */

import * as fs from "fs";

import { ArgumentParser } from "argparse";
import { config } from "dotenv";
import jscodeshift from "jscodeshift";

import { getCachedWikiPages, WikiPage } from "src/domain/gitlab-wiki-api";
import { wikiPageSlugs } from "src/domain/wiki";

// Load environment variables from .env file
config();

const getAllWikiPages = async (): Promise<WikiPage[]> => {
  const gitlabWikiUrl = process.env.GITLAB_WIKI_URL;
  const gitlabWikiToken = process.env.GITLAB_WIKI_TOKEN;

  if (!gitlabWikiUrl || !gitlabWikiToken) {
    throw new Error(
      "Please set GITLAB_WIKI_URL and GITLAB_WIKI_TOKEN environment variables to fetch content from GitLab Wiki."
    );
  }

  try {
    const wikiPages = await getCachedWikiPages(
      `${gitlabWikiUrl}?with_content=1`,
      gitlabWikiToken
    );

    return wikiPages;
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Getting Wiki from API failed with error:", error.message);
    throw e;
  }
};

const fetchWikiPages = async () => {
  const pages = await getAllWikiPages();

  // Group pages by their base page name
  const groupedPages = new Map<string, LocalizedWikiPage[]>();

  // Define the LocalizedWikiPage type
  type LocalizedWikiPage = WikiPage & {
    baseSlug: string;
    language: string;
  };

  pages.forEach((page) => {
    // Try to parse slug in the format <page>/<language> with named groups
    // @ts-expect-error TypeScript does not recognize the named groups in the regex,
    // but it works at runtime
    const match = page.slug.match(/^(?<page>.+)\/(?<language>[a-z]{2})$/);
    if (match?.groups) {
      const baseSlug = match.groups.page;
      const language = match.groups.language;

      if (!groupedPages.has(baseSlug)) {
        groupedPages.set(baseSlug, []);
      }

      // Add the page with additional properties
      groupedPages.get(baseSlug)?.push({
        ...page,
        baseSlug,
        language,
      } as LocalizedWikiPage);
    }
  });

  // Get available pages (those with content)
  const available = Array.from(groupedPages.keys());

  // Get missing pages (those defined in wikiPageSlugs but not found)
  const existing = new Set(available);
  const missing = [...wikiPageSlugs.available, ...wikiPageSlugs.missing].filter(
    (slug) => !existing.has(slug)
  );

  return {
    available,
    missing,
  };
};

const main = async (): Promise<void> => {
  const parser = new ArgumentParser({
    description: "Script to manage wiki content from GitLab",
  });

  const subparsers = parser.add_subparsers({
    title: "commands",
    dest: "command",
    required: true,
  });

  // Create pages subparser
  const pagesParser = subparsers.add_parser("pages", {
    help: "Get available and missing wiki pages",
  });

  pagesParser.add_argument("--format", {
    choices: ["text", "json", "typescript"],
    default: "text",
    help: "Output format for the list of wiki pages",
  });

  pagesParser.add_argument("--variable-name", {
    help: "Output variable name for the TypeScript format",
  });

  pagesParser.add_argument("--file", {
    help: "File to save the output to (only for typescript formats)",
  });

  const args = parser.parse_args();
  const { format, command } = args;

  switch (command) {
    case "pages":
      const result = await fetchWikiPages();
      if (format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else if (format === "text") {
        console.log("Available pages:");
        result.available.forEach((slug) => {
          console.log(`  - ${slug}`);
        });
        console.log("\nMissing pages:");
        result.missing.forEach((slug) => {
          console.log(`  - ${slug}`);
        });
      } else if (format === "typescript") {
        // read the file path from args.file, parse it with jscodeshift and replace the variable
        // declaration with the new value
        if (!args.file) {
          console.error(
            "Please provide a file path with --file for TypeScript output."
          );
          process.exit(1);
        }
        const variableName = args.variable_name || "wikiPageSlugs";
        const filePath = args.file;

        //  parse with jscodeshift
        const fileContent = fs.readFileSync(filePath, "utf8");
        const root = jscodeshift.withParser("ts")(fileContent);
        const variableDeclaration = root.find(
          jscodeshift.VariableDeclaration,
          (node) => {
            const decl = node.declarations[0];
            if (
              !decl ||
              decl.type !== "VariableDeclarator" ||
              decl.id.type !== "Identifier"
            ) {
              return false;
            }
            return decl.id.name === variableName;
          }
        );
        const source = `const a = ${JSON.stringify(result, null, 2)} as const`;
        const literal = jscodeshift
          .withParser("tsx")(source)
          .find(jscodeshift.TSAsExpression)
          .get(0).node;
        const declaration = jscodeshift.variableDeclaration("const", [
          jscodeshift.variableDeclarator(
            jscodeshift.identifier(variableName),
            literal
          ),
        ]);
        if (variableDeclaration.length > 0) {
          variableDeclaration.replaceWith(declaration);
        } else {
          root.get().node.program.body.push(declaration);
        }
        const output = root.toSource();
        // Write the output to the specified file
        fs.writeFile(filePath, output, (err: NodeJS.ErrnoException | null) => {
          if (err) {
            console.error(`Error writing to file ${filePath}:`, err.message);
            process.exit(1);
          }
          console.log(`Wiki pages saved to ${filePath}`);
        });
      }
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
};

// Run the script if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}
