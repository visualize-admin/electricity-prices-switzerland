import { Trans } from "@lingui/macro";
import { Box, Flex, Text } from "theme-ui";

import buildEnv from "src/env/build";

import { LanguageMenu } from "./language-menu";
import { HomeLink } from "./links";
import { LogoDesktop, LogoMobile } from "./logo";

export const Header = ({
  pageType = "app",
  contentId,
}: {
  pageType?: "content" | "app";
  contentId?: string;
}) => {
  return (
    <Flex
      as="header"
      sx={
        pageType === "content"
          ? {
              px: [0, 4, 4],
              pt: [0, 3, 3],
              pb: [0, 5, 5],
              borderBottomWidth: "4px",
              borderBottomStyle: "solid",
              borderBottomColor: "brand",
              bg: "grey[100]",
              color: "grey[700]",
              flexDirection: ["column", "row"],
            }
          : {
              px: [0, 4, 4],
              pt: [0, 3, 3],
              pb: [0, 5, 5],
              borderBottomWidth: "4px",
              borderBottomStyle: "solid",
              borderBottomColor: "brand",
              bg: "grey[100]",
              color: "grey[700]",
              flexDirection: ["column", "row"],
              // Needs to be "fixed" to prevent
              // iOS full-page scrolling
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              overflowY: "hidden",
              zIndex: 15,
            }
      }
    >
      <LanguageMenu contentId={contentId} />
      <Logo />
    </Flex>
  );
};

export const Logo = () => {
  return (
    <HomeLink passHref>
      <Flex
        as="div"
        sx={{
          order: [2, 1],
          alignItems: ["center", "flex-start"],
          cursor: "pointer",
          textDecoration: "none",
          color: "grey[900]",
        }}
      >
        <Box
          role="figure"
          aria-labelledby="logo"
          sx={{ display: ["block", "none"], mx: 4, my: 4, width: 24 }}
        >
          <LogoMobile />
        </Box>
        <Box
          role="figure"
          aria-labelledby="logo"
          sx={{
            display: ["none", "block"],
            pr: 6,
            borderRightWidth: "1px",
            borderRightStyle: "solid",
            borderRightColor: "grey[300]",
            color: "grey[900]",
          }}
        >
          <LogoDesktop />
        </Box>
        <Text
          as="h1"
          variant="lead"
          sx={{ pl: [0, 6], textDecoration: "none", color: "grey[800]" }}
        >
          <Trans id="site.title">Strompreise Schweiz</Trans>
          {buildEnv.DEPLOYMENT &&
            ` [${buildEnv.DEPLOYMENT.toLocaleUpperCase()}]`}
        </Text>
      </Flex>
    </HomeLink>
  );
};
