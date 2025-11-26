import fs from "fs";
import { join } from "path";

import { describe, it, expect } from "vitest";

type WikiEntry = {
  format: string;
  content: string;
  title: string;
  slug: string;
};

describe("wiki-content", () => {
  it("should have valid markdown links", () => {
    const wikiContent = fs.readFileSync(
      join(__dirname, "./content.json"),
      "utf-8"
    );
    const data = JSON.parse(wikiContent) as WikiEntry[];

    // Regex to match markdown links: [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    const invalidLinks: { slug: string; link: string; url: string }[] = [];

    // Process each entry
    data.forEach((entry) => {
      if (entry.format === "markdown" && entry.content) {
        const matches = [...entry.content.matchAll(markdownLinkRegex)];

        matches.forEach((match) => {
          const url = match[2];

          // Check if URL is valid (you can add more validation here)
          if (!url || url.trim() === "") {
            invalidLinks.push({
              slug: entry.slug,
              link: match[0],
              url: url,
            });
          }
        });
      }
    });

    expect(
      invalidLinks,
      `Found ${invalidLinks.length} invalid links: ${JSON.stringify(
        invalidLinks,
        null,
        2
      )}`
    ).toHaveLength(0);
  });
});
