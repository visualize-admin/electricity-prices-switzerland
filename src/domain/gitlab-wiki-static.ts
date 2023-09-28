import wikiPages_ from "src/wiki-content.json";

const wikiPages = wikiPages_ as WikiPage[];

type WikiPage = {
  format: string;
  slug: string;
  title: string;
  content: string;
};

export const getWikiPage = async (
  slug: string
): Promise<WikiPage | undefined> => {
  return wikiPages.find((page) => page.slug === slug);
};
