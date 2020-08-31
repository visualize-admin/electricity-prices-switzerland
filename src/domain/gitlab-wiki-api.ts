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

  const res = await fetch(`${process.env.GITLAB_WIKI_URL}?with_content=1`, {
    headers: { "PRIVATE-TOKEN": process.env.GITLAB_WIKI_TOKEN },
  });

  const wikiPages: {
    format: string;
    slug: string;
    title: string;
    content: string;
  }[] = await res.json();

  const bannerEnabled = wikiPages
    .find((page) => page.slug === "home")
    ?.content.match(/home_banner_enabled:\W*true/)
    ? true
    : false;

  return {
    bannerEnabled,
    bannerContent: bannerEnabled
      ? wikiPages.find((page) => page.slug === `home-banner/${locale}`)
          ?.content ?? ""
      : "",
  };
};
