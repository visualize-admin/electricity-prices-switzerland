import fs from "fs";
import { join } from "path";

import { describe, it, expect } from "vitest";

type WikiEntry = {
  format: string;
  content: string;
  title: string;
  slug: string;
};

const checkURL = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      console.error(`URL ${url} returned status ${response.status}`);
      console.error(`Response text: ${await response.text()}`);
    }
    return response.ok;
  } catch (e) {
    console.error(`Error fetching URL ${url}:`, e);
    return false;
  }
};

// Important: the fn should not throw otherwise behavior is undefined
const promisePool = async <T, TResolve>(
  items: T[],
  poolSize: number,
  fn: (item: T) => Promise<TResolve>
): Promise<TResolve[]> => {
  const resolves: TResolve[] = [];

  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = fn(item).then((result) => {
      resolves.push(result);
      executing.splice(
        executing.findIndex((e) => e === p),
        1
      );
    });
    executing.push(p);

    if (executing.length >= poolSize) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return resolves;
};

describe("wiki-content", () => {
  it("should have valid markdown links", async () => {
    const wikiContent = fs.readFileSync(
      join(__dirname, "./content.json"),
      "utf-8"
    );
    const data = JSON.parse(wikiContent) as WikiEntry[];

    // Regex to match markdown links: [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    const invalidLinks: { slug: string; link: string; url: string }[] = [];

    // Process each entry
    const urls = data.flatMap((entry) => {
      if (entry.format === "markdown" && entry.content) {
        const matches = [...entry.content.matchAll(markdownLinkRegex)];

        return matches.map((match) => ({
          slug: entry.slug,
          link: match[0],
          url: match[2],
        }));
      }
      return [];
    });

    await promisePool(urls, 2, async ({ slug, link, url }) => {
      const isValid = await checkURL(url).catch(() => false);
      if (!isValid) {
        invalidLinks.push({ slug, link, url });
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
