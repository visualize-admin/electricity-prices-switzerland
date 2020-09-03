import { Trans } from "@lingui/macro";
import { useCallback, useMemo } from "react";
import { Box, Flex, Grid, Text } from "theme-ui";
import { DownloadImage } from "../../components/detail-page/download-image";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { List } from "../../components/list";
import { ChoroplethMap } from "../../components/map";
import { Search } from "../../components/search";
import { Selector } from "../../components/selector";
import { useColorScale } from "../../domain/data";
import {
  OperatorObservationFieldsFragment,
  PriceComponent,
  useObservationsQuery,
} from "../../graphql/queries";
import { EMPTY_ARRAY } from "../../lib/empty-array";
import { useQueryStateSingle } from "../../lib/use-query-state";
import { locales } from "../../locales/locales";
import { GetServerSideProps } from "next";
import { Hint, HintBlue } from "../../components/hint";
import {
  getBannerFromGitLabWiki,
  getHelpCalculationPageFromGitLabWiki,
} from "../../domain/gitlab-wiki-api";
import Head from "next/head";
import { useI18n } from "../../components/i18n-context";

const DOWNLOAD_ID = "map";

type Props = {
  locale: string;
  bannerEnabled: boolean;
  bannerContent: string;
  calculationHelpText: string;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string }
> = async ({ params }) => {
  const locale = params!.locale;

  try {
    const { bannerEnabled, bannerContent } = await getBannerFromGitLabWiki({
      locale,
    });

    const calculationHelpText = await getHelpCalculationPageFromGitLabWiki({
      locale,
    });

    return {
      props: { locale, bannerEnabled, bannerContent, calculationHelpText },
    };
  } catch (e) {
    console.error(e);
  }

  return {
    props: {
      locale,
      bannerEnabled: false,
      bannerContent: "",
      calculationHelpText: "",
    },
  };
};

const HEADER_HEIGHT_S = "107px";
const HEADER_HEIGHT_M_UP = "96px";

const IndexPage = ({
  locale,
  bannerEnabled,
  bannerContent,
  calculationHelpText,
}: Props) => {
  const [
    { period, priceComponent, category, product, download },
  ] = useQueryStateSingle();

  const i18n = useI18n();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      locale,
      priceComponent: priceComponent as PriceComponent,
      filters: {
        period: [period],
        category: [
          `https://energy.ld.admin.ch/elcom/electricity-price/category/${category}`,
        ],
        product: [product],
      },
    },
  });

  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.observations ?? EMPTY_ARRAY;

  const operatorObservations = useMemo<
    OperatorObservationFieldsFragment[]
  >(() => {
    return observations.filter(
      (d): d is OperatorObservationFieldsFragment =>
        d.__typename === "OperatorObservation"
    );
  }, [observations]);

  const colorAccessor = useCallback((d) => d.value, []);
  const colorScale = useColorScale({
    observations,
    accessor: colorAccessor,
  });

  return (
    <>
      <Head>
        <title>{i18n._("site.title")}</title>
      </Head>
      <Grid
        sx={{
          minHeight: "100vh",
          gap: 0,
          gridTemplateRows: [
            `${HEADER_HEIGHT_S} 1fr auto`,
            `${HEADER_HEIGHT_M_UP} 1fr auto`,
          ],
        }}
      >
        <Box>
          <Header></Header>
        </Box>
        <Box
          sx={{
            position: "relative",
          }}
        >
          {bannerEnabled ? (
            <HintBlue iconName="info">{bannerContent}</HintBlue>
          ) : null}
          <Flex
            sx={{
              py: 8,
              flexDirection: "column",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: "monochrome500",
              px: 4,
            }}
          >
            <Text
              as="h1"
              variant="giga"
              sx={{ textAlign: ["left", "left", "center"] }}
            >
              <Trans id="site.title">Strompreise Schweiz</Trans>
            </Text>

            <Text
              variant="paragraph1"
              sx={{
                width: "100%",
                textAlign: ["left", "left", "center"],
                color: "monochrome800",
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
            </Text>

            <Search />
          </Flex>
          <Grid
            sx={{
              width: "100%",
              gridTemplateColumns: ["1fr", "1fr 20rem"],
              gridTemplateAreas: [`"controls" "map"`, `"map controls"`],
              gap: 0,
              position: "relative",
            }}
          >
            <Box
              // id used by the screenshot service
              id={DOWNLOAD_ID}
              sx={{
                bg: "monochrome200",
                top: [0, HEADER_HEIGHT_M_UP],
                width: "100%",
                gridArea: "map",
                height: ["70vw", `calc(100vh - ${HEADER_HEIGHT_M_UP})`],
                maxHeight: ["50vh", "100vh"],
                position: ["relative", "sticky"],
                borderRightWidth: "1px",
                borderRightStyle: "solid",
                borderRightColor: "monochrome500",
              }}
            >
              <ChoroplethMap
                year={period}
                observations={operatorObservations}
                observationsQueryFetching={observationsQuery.fetching}
                colorScale={colorScale}
              />

              {!download && (
                <Box
                  sx={{
                    zIndex: 13,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    mb: 3,
                    ml: 3,
                  }}
                >
                  <DownloadImage
                    elementId={DOWNLOAD_ID}
                    fileName={DOWNLOAD_ID}
                    downloadType={DOWNLOAD_ID}
                  />
                </Box>
              )}
            </Box>
            <Box sx={{ gridArea: "controls" }}>
              <Box
                sx={
                  {
                    // position: ["relative", "sticky"],
                    // top: [0, HEADER_HEIGHT_M_UP],
                    // zIndex: 1,
                  }
                }
              >
                <Selector />
              </Box>
              <List
                observations={observations}
                colorScale={colorScale}
                observationsQueryFetching={observationsQuery.fetching}
              />
            </Box>
          </Grid>
        </Box>
        <Footer calculationHelpText={calculationHelpText}></Footer>
      </Grid>
    </>
  );
};

export default IndexPage;
