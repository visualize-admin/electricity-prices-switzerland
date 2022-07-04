import fs from "fs-extra";
import os from "os";
import path from "path";
import { getWikiPage as getStaticWikiPage } from "./gitlab-wiki-static";

type WikiPage = {
  format: string;
  slug: string;
  title: string;
  content: string;
};

type WikiPages = WikiPage[];

type WikiCacheJson = {
  _created: number;
  pages: WikiPages;
};

const CACHE_TTL = 1000;

const fetchWithTimeout = async (
  url: string,
  options: RequestInit & { timeout?: number } = {}
) => {
  const { timeout } = options;

  const controller = new AbortController();
  const id =
    timeout !== undefined
      ? setTimeout(() => controller.abort(), timeout)
      : undefined;
  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  if (id !== undefined) {
    clearTimeout(id);
  }
  return response;
};

const getCachedWikiPages = async (
  url: string,
  token: string
): Promise<WikiPages> => {
  const filePath = path.join(os.tmpdir(), url.replace(/\W+/g, "-") + ".json");

  if (fs.existsSync(filePath)) {
    const json: WikiCacheJson = await fs.readJSON(filePath);

    if (Date.now() - json._created < CACHE_TTL) {
      console.log("Using cached wiki pages");
      return json.pages;
    }

    await fs.remove(filePath);
  }

  const res = await fetchWithTimeout(url, {
    headers: { "PRIVATE-TOKEN": token },
    timeout: 8000,
  });
  const pages: WikiPages = await res.json();

  const json: WikiCacheJson = { _created: Date.now(), pages };
  await fs.writeJSON(filePath, json);

  return pages;
};

export const getWikiPage = async (
  slug: string
): Promise<WikiPage | undefined> => {
  if (!process.env.GITLAB_WIKI_URL || !process.env.GITLAB_WIKI_TOKEN) {
    throw Error(
      "Please set GITLAB_WIKI_URL and GITLAB_WIKI_TOKEN environment variables to fetch content from GitLab Wiki."
    );
  }

  try {
    const wikiPages = await getCachedWikiPages(
      `${process.env.GITLAB_WIKI_URL}?with_content=1`,
      process.env.GITLAB_WIKI_TOKEN
    );

    return wikiPages.find((page) => page.slug === slug);
  } catch (e: $IntentionalAny) {
    console.warn("Getting Wiki from API failed with error", e.message);
    console.log("Serving build-time Wiki content instead");
    return getStaticWikiPage(slug);
  }
};
