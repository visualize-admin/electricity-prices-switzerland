import { Box } from "@mui/material";

import { useWikiContentQuery } from "src/graphql/queries";
import { useLocale } from "src/lib/use-locale";

import { HintBlue } from "./hint";

export const InfoBanner = ({
  bypassBannerEnabled,
}: {
  bypassBannerEnabled: boolean;
}) => {
  const locale = useLocale();
  const [contentQuery] = useWikiContentQuery({
    variables: { locale, slug: "home-banner" },
  });

  // Don't show loading/error state for banner
  if (contentQuery.fetching) {
    return null;
  }

  if (!contentQuery.data?.wikiContent) {
    return null;
  }

  const wikiContent = contentQuery.data?.wikiContent;
  if (!wikiContent.info.bannerEnabled && !bypassBannerEnabled) {
    return null;
  }

  return (
    <HintBlue iconName="info">
      {
        <Box
          component="section"
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
