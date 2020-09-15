import fs from "fs-extra";
import path from "path";
import os from "os";
import micromark from "micromark";

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

const CACHE_TTL = 1000 * 5 * 60;

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

  const res = await fetch(url, {
    headers: { "PRIVATE-TOKEN": token },
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

  const wikiPages = await getCachedWikiPages(
    `${process.env.GITLAB_WIKI_URL}?with_content=1`,
    process.env.GITLAB_WIKI_TOKEN
  );

  return wikiPages.find((page) => page.slug === slug);
};

export const getBannerFromGitLabWiki = async ({
  locale,
}: {
  locale: string;
}) => {
  if (!process.env.GITLAB_WIKI_URL || !process.env.GITLAB_WIKI_TOKEN) {
    throw Error(
      "Please set GITLAB_WIKI_URL and GITLAB_WIKI_TOKEN environment variables to fetch content from GitLab Wiki."
    );
  }

  const wikiPages = await getCachedWikiPages(
    `${process.env.GITLAB_WIKI_URL}?with_content=1`,
    process.env.GITLAB_WIKI_TOKEN
  );

  const bannerEnabled = (await getWikiPage("home"))?.content.match(
    /home_banner_enabled:\W*true/
  )
    ? true
    : false;

  return {
    bannerEnabled,
    bannerContent: bannerEnabled
      ? (await getWikiPage(`home-banner/${locale}`))?.content ?? ""
      : "",
  };
};

export const getHelpCalculationPageFromGitLabWiki = async ({
  locale,
}: {
  locale: string;
}): Promise<string> => {
  return micromark(
    (await getWikiPage(`help-calculation/${locale}`))?.content ?? ""
  );
};
