import https from 'https'
import os from "os";
import path from "path";

import fs from "fs-extra";

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
  options: RequestInit & { timeout?: number, agent?: https.Agent } = {}
) => {
  const { timeout } = options;

  let id;
  const aborter = new Promise((resolve, reject) =>
    timeout !== undefined
      ? (id = setTimeout(() => reject(new Error("Timeout")), timeout))
      : undefined
  );
  const fetcher = await fetch(url, options);
  if (id !== undefined) {
    clearTimeout(id);
  }
  const value = await Promise.race([aborter, fetcher]);
  return value as Response;
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

    // This is necessary for GLOBAL_AGENT to correctly override the agent while
    // the GLOBAL_AGENT_FORCE_GLOBAL_AGENT variable is set
    agent: https.globalAgent
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
