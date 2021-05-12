import wikiPages from "../wiki-content.json";

type WikiPage = {
  format: string;
  slug: string;
  title: string;
  content: string;
};

type WikiPages = WikiPage[];

export const getWikiPage = async (
  slug: string
): Promise<WikiPage | undefined> => {
  return wikiPages.find((page) => page.slug === slug);
};
