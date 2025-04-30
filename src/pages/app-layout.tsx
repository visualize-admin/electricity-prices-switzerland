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
import { UseQueryState } from "urql";

import { Footer } from "src/components/footer";
import { Header } from "src/components/header";
import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { InfoBanner } from "src/components/info-banner";
import { Search } from "src/components/search";
import {
  Exact,
  InputMaybe,
  ObservationFilters,
  ObservationKind,
  ObservationsQuery,
  PriceComponent,
  Scalars,
  useObservationsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useQueryStateSingle } from "src/lib/use-query-state";

type Props = {
  locale: string;
  children: ReactNode;
};

export const ApplicationLayout = ({ locale, children }: Props) => {
  const [{ period, priceComponent, category, product }] = useQueryStateSingle();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      locale,
      priceComponent: priceComponent as PriceComponent,
      filters: {
        period: [period],
        category: [category],
        product: [product],
      },
    },
  });

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
          <AppNavigation observationsQuery={observationsQuery} />
          {children}
        </Box>
      </Box>
      <Footer />
    </HighlightContext.Provider>
  );
};

type ApplicationNavigationProps = {
  observationsQuery: UseQueryState<
    ObservationsQuery,
    Exact<{
      locale: Scalars["String"]["input"];
      priceComponent: PriceComponent;
      filters: ObservationFilters;
      observationKind?: InputMaybe<ObservationKind>;
    }>
  >;
};
const AppNavigation = (props: ApplicationNavigationProps) => {
  const { observationsQuery } = props;
  const { pathname } = useRouter();

  const swissMedianObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.swissMedianObservations ?? EMPTY_ARRAY;

  const medianValue = swissMedianObservations[0]?.value;

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <InfoBanner
        bypassBannerEnabled={
          !!(
            observationsQuery.fetching === false &&
            observationsQuery.data &&
            !medianValue
          )
        }
      />
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
          title={t({ id: "home.menu.overview", message: "Overview" })}
          active={pathname === "/"}
          href={"/"}
        />
        <MenuButton
          title={t({ id: "home.menu.map-view", message: "Map View" })}
          active={
            pathname === "/map" ||
            pathname.includes("municipality") ||
            pathname.includes("canton")
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
