import { Trans } from "@lingui/macro";
import { Box, Flex, Text } from "theme-ui";
import { LanguageMenu } from "./language-menu";
import NextLink from "next/link";
import { LogoDesktop, LogoMobile } from "./logo";
import { useRouter } from "next/router";
import { HomeLink } from "./links";
import { SectionContentContainer } from "./SectionContentContainer";

export const Header = ({
  pageType = "app",
  contentId,
}: {
  pageType?: "content" | "app";
  contentId?: string;
}) => {
  return (
    <Box
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
              bg: "monochrome100",
              color: "monochrome700",
            }
          : {
              px: [0, 4, 4],
              pt: [0, 3, 3],
              pb: [0, 5, 5],
              borderBottomWidth: "4px",
              borderBottomStyle: "solid",
              borderBottomColor: "brand",
              bg: "monochrome100",
              color: "monochrome700",
              // Needs to be "fixed" to prevent
              // iOS full-page scrolling
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              width: "100%",
              overflowY: "hidden",
              zIndex: 15,
            }
      }
    >
      <SectionContentContainer>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: ["column", "row"],
          }}
        >
          <LanguageMenu contentId={contentId} />
          <Logo />
        </Box>
      </SectionContentContainer>
    </Box>
  );
};

export const Logo = () => {
  const { query } = useRouter();
  return (
    <HomeLink passHref>
      <Flex
        as="a"
        sx={{
          order: [2, 1],
          alignItems: ["center", "flex-start"],
          cursor: "pointer",
          textDecoration: "none",
          color: "monochrome900",
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
            borderRightColor: "monochrome300",
            color: "monochrome900",
          }}
        >
          <LogoDesktop />
        </Box>
        <Text
          as="h1"
          variant="lead"
          sx={{ pl: [0, 6], textDecoration: "none", color: "monochrome800" }}
        >
          <Trans id="site.title">Strompreise Schweiz</Trans>
          {process.env.DEPLOYMENT &&
            ` [${process.env.DEPLOYMENT.toLocaleUpperCase()}]`}
        </Text>
      </Flex>
    </HomeLink>
  );
};
