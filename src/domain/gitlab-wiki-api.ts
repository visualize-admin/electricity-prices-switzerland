import https from "https";
import os from "os";
import path from "path";

import fs from "fs-extra";

import { getWikiPage as getStaticWikiPage } from "src/domain/gitlab-wiki-static";
import serverEnv from "src/env/server";
import { setupUndiciHttpAgent } from "src/pages/api/http-agent";

export type WikiPage = {
  format: string;
  slug: string;
  title: string;
  content: string;
};

type WikiCacheJson = {
  _created: number;
  pages: WikiPage[];
};

const CACHE_TTL = 1000;

const fetchWithTimeout = async (
  url: string,
  options: RequestInit & { timeout?: number; agent?: https.Agent } = {}
) => {
  const { timeout } = options;

  let id;
  const aborter = new Promise((_, reject) =>
    timeout !== undefined
      ? (id = setTimeout(() => reject(new Error("Timeout")), timeout))
      : undefined
  );
  setupUndiciHttpAgent();

  const fetcher = await fetch(url, options);
  if (id !== undefined) {
    clearTimeout(id);
  }
  const value = await Promise.race([aborter, fetcher]);
  return value as Response;
};

export const getCachedWikiPages = async (
  url: string,
  token: string
): Promise<WikiPage[]> => {
  const filePath = path.join(os.tmpdir(), url.replace(/\W+/g, "-") + ".json");

  if (fs.existsSync(filePath)) {
    const json: WikiCacheJson = await fs.readJSON(filePath);

    if (Date.now() - json._created < CACHE_TTL) {
      console.info("Using cached wiki pages");
      return json.pages;
    }

    await fs.remove(filePath);
  }

  const res = await fetchWithTimeout(url, {
    headers: { "PRIVATE-TOKEN": token },
    timeout: 8000,

    // This is necessary for GLOBAL_AGENT to correctly override the agent while
    // the GLOBAL_AGENT_FORCE_GLOBAL_AGENT variable is set
    agent: https.globalAgent,
  });
  const pages: WikiPage[] = await res.json();

  const json: WikiCacheJson = { _created: Date.now(), pages };
  await fs.writeJSON(filePath, json);

  return pages;
};

export const getWikiPage = async (
  slug: string
): Promise<WikiPage | undefined> => {
  if (!serverEnv?.GITLAB_WIKI_URL || !serverEnv.GITLAB_WIKI_TOKEN) {
    throw Error(
      "Please set GITLAB_WIKI_URL and GITLAB_WIKI_TOKEN environment variables to fetch content from GitLab Wiki."
    );
  }

  try {
    const wikiPages = await getCachedWikiPages(
      `${serverEnv.GITLAB_WIKI_URL}?with_content=1`,
      serverEnv.GITLAB_WIKI_TOKEN
    );

    return wikiPages.find((page) => page.slug === slug);
  } catch (e: $IntentionalAny) {
    console.warn("Getting Wiki from API failed with error", e.message);
    console.info("Serving build-time Wiki content instead");
    return getStaticWikiPage(slug);
  }
};
