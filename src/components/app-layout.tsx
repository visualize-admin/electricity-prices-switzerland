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
import { SafeHydration } from "src/components/hydration";
import { Search } from "src/components/search";

type ApplicationLayoutProps = {
  children: ReactNode;
  errorState?: boolean;
};

export const ApplicationLayout = ({
  children,
  errorState,
}: ApplicationLayoutProps) => {
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
          {!errorState && (
            <SafeHydration>
              <AppNavigation />
            </SafeHydration>
          )}
          {children}
        </Box>
        <Footer />
      </Box>
    </HighlightContext.Provider>
  );
};

const AppNavigation = () => {
  const { asPath: asPathWithQueryString } = useRouter();
  const asPath = asPathWithQueryString.split("?")[0];

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
          display="none"
        >
          <Typography
            component="h1"
            variant="display2"
            sx={{ textAlign: "left" }}
          >
            <Trans id="site.title">Electricity tariffs in Switzerland</Trans>
          </Typography>
          <Typography
            variant="h3"
            sx={{
              width: "100%",
              color: "secondary.500",
              mt: 2,
              mb: 2,
            }}
          >
            <Trans id="search.global">
              Detailed price analyses of cantons, municipalities and grid
              operators.
            </Trans>
          </Typography>
        </Box>
      </ContentWrapper>
      {/* FIXME: creates ugly x-scroll  due to nested ContentWrapper */}
      <MenuContainer
        sx={{
          px: 3,
        }}
      >
        <MenuButton
          title={t({ id: "home.menu.overview", message: "Overview" })}
          active={asPath === "/"}
          href={"/"}
          //FIXME: alter MenuButton for searchbar spacing, goal is to have the bottom red border, aligned with bottom of MenuContainer
          sx={{
            ".MuiButtonBase-root": {
              py: {
                md: 6,
              },
            },
          }}
        />
        <MenuButton
          title={t({ id: "home.menu.map-view", message: "Map view" })}
          active={
            asPath === "/map" ||
            asPath.includes("municipality") ||
            asPath.includes("canton")
          }
          href={"/map"}
          //FIXME: alter MenuButton for searchbar spacing
          sx={{
            ".MuiButtonBase-root": {
              py: {
                md: 6,
              },
            },
          }}
        />
        <Box sx={{ flex: 1 }} />
        <Search />
      </MenuContainer>
    </Box>
  );
};
