import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import {
  MenuButton,
  MenuContainer,
} from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { t, Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";

import { Footer } from "src/components/footer";
import { Header } from "src/components/header";
import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { Search } from "src/components/search";

type ApplicationLayoutProps = {
  children: ReactNode;
};

export const ApplicationLayout = ({ children }: ApplicationLayoutProps) => {
  const [highlightContext, setHighlightContext] = useState<HighlightValue>();

  return (
    <HighlightContext.Provider
      value={{
        value: highlightContext,
        setValue: setHighlightContext,
      }}
    >
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
        }}
      >
        <Header />
        <Box
          sx={{
            flexDirection: "column",
          }}
          display="flex"
        >
          <AppNavigation />
          {children}
        </Box>
      </Box>
      <Footer />
    </HighlightContext.Provider>
  );
};

const AppNavigation = () => {
  const { asPath } = useRouter();

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <ContentWrapper>
        <Box
          sx={{
            py: 8,
            flexDirection: "column",
            gap: 4,
          }}
          display="flex"
        >
          <Typography
            component="h1"
            variant="display2"
            sx={{ textAlign: "left" }}
          >
            <Trans id="site.title">Electricity Tariffs and Regulations</Trans>
          </Typography>
          <Typography
            variant="h3"
            sx={{
              width: "100%",
              color: "secondary.500",
              mt: 2,
              mb: 2,
              height: [0, 0, "unset"],
              visibility: ["hidden", "hidden", "visible"],
            }}
          >
            <Trans id="search.global">
              Detaillierte Preisanalysen von Kantonen, Gemeinden und
              Netzbetreibern.
            </Trans>
          </Typography>
        </Box>
      </ContentWrapper>

      <MenuContainer
        sx={{
          px: 3,
          borderTopWidth: 1,
          borderTopStyle: "solid",
          borderTopColor: "monochrome.300",
        }}
      >
        <MenuButton
          title={t({ id: "home.menu.overview", message: "Übersicht" })}
          active={asPath === "/"}
          href={"/"}
        />
        <MenuButton
          title={t({ id: "home.menu.map-view", message: "Karten Ansicht" })}
          active={
            asPath === "/map" ||
            asPath.includes("municipality") ||
            asPath.includes("canton")
          }
          href={"/map"}
        />
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            minWidth: "22rem",
          }}
        >
          <Search />
        </Box>
      </MenuContainer>
    </Box>
  );
};
