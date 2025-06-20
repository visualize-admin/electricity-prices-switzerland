import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { useState } from "react";

import { HintBlue } from "src/components/hint";
import { useWikiContentQuery } from "src/graphql/queries";
import { useLocale } from "src/lib/use-locale";

const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);

export const InfoBanner = ({
  bypassBannerEnabled,
}: {
  bypassBannerEnabled: boolean;
}) => {
  const locale = useLocale();
  const [open, setOpen] = useState(true);
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

  return open ? (
    <HintBlue iconName="infocircle" onRemove={() => setOpen(false)}>
      <Box sx={{ px: 3 }}>
        <ContentWrapper>
          {
            <Box
              component="section"
              dangerouslySetInnerHTML={{
                __html: contentQuery.data.wikiContent.html,
              }}
              sx={{
                "& > :first-of-type": { pt: 0, mt: 0 },
                "& > :last-of-type": { mb: 0, pb: 0 },
              }}
            />
          }
        </ContentWrapper>
      </Box>
    </HintBlue>
  ) : null;
};
