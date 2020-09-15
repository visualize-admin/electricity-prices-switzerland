import { Box } from "theme-ui";
import { useWikiContentQuery } from "../graphql/queries";
import { useLocale } from "../lib/use-locale";
import { HintBlue } from "./hint";

export const InfoBanner = () => {
  const locale = useLocale();
  const [contentQuery] = useWikiContentQuery({
    variables: { locale, slug: "home-banner" },
  });

  // Don't show loading/error state for banner
  if (contentQuery.fetching || !contentQuery.data?.wikiContent) {
    return null;
  }

  return (
    <HintBlue iconName="info">
      {
        <Box
          as="section"
          dangerouslySetInnerHTML={{
            __html: contentQuery.data.wikiContent.html,
          }}
          sx={{
            "& > :first-child": { pt: 0, mt: 0 },
            "& > :last-child": { mb: 0, pb: 0 },
          }}
        />
      }
    </HintBlue>
  );
};
