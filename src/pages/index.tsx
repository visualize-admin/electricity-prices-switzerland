import { t, Trans } from "@lingui/macro";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import basicAuthMiddleware from "nextjs-basic-auth-middleware";
import { useCallback, useRef, useState } from "react";
import { Box, Button, Flex, Grid, Input, Link, Text } from "theme-ui";
import { DownloadImage } from "../components/detail-page/download-image";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { InfoBanner } from "../components/info-banner";
import { List } from "../components/list";
import {
  ChoroplethMap,
  HighlightContext,
  HighlightValue,
} from "../components/map";
import { Search } from "../components/search";
import { Selector } from "../components/selector";
import { useColorScale } from "../domain/data";
import {
  PriceComponent,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
} from "../graphql/queries";
import { EMPTY_ARRAY } from "../lib/empty-array";
import { useQueryStateSingle } from "../lib/use-query-state";
import { useDisclosure } from "../components/useDisclosure";
import { Tooltip } from "../components/charts-generic/interaction/tooltip";
import { TooltipBox } from "../components/charts-generic/interaction/tooltip-box";
import { IconCopy } from "../icons/ic-copy";
import useOutsideClick from "../components/useOutsideClick";

const DOWNLOAD_ID = "map";

type Props = {
  locale: string;
};

export const getServerSideProps: GetServerSideProps<Props, { locale: string }> =
  async ({ locale, req, res }) => {
    await basicAuthMiddleware(req, res);

    return {
      props: {
        locale: locale!,
      },
    };
  };

const HEADER_HEIGHT_S = "107px";
const HEADER_HEIGHT_M_UP = "96px";

const copyToClipboard = async function (text: string) {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Text copied to clipboard");
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
  }
};

const ShareButton = () => {
  const { isOpen, open, close } = useDisclosure();
  const {
    isOpen: hasInputFocus,
    open: setFocusOn,
    close: setFocusOff,
  } = useDisclosure();
  const tooltipBoxRef = useRef<HTMLDivElement>(null);

  const linkRef = useRef<HTMLAnchorElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const handleClick = () => {
    open();
    const linkRect = linkRef.current?.getBoundingClientRect() || {
      x: 0,
      y: 0,
      width: 0,
    };
    Object.assign(mouse.current, {
      x: linkRect?.x + linkRect?.width / 2,
      y: linkRect?.y,
    });
  };

  useOutsideClick(tooltipBoxRef, () => {
    close();
    setFocusOff();
  });

  const { isOpen: hasCopied, setIsOpen: setCopied } = useDisclosure();

  const handleClickCopyButton = async () => {
    await copyToClipboard(window.location.toString());
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  return (
    <>
      <Link variant="inline" ref={linkRef} onClick={handleClick}>
        {t({ id: "map.share", message: "Teilen" })}
      </Link>
      {isOpen ? (
        <TooltipBox
          ref={tooltipBoxRef}
          placement={{ x: "center", y: "top" }}
          margins={{ top: 0, bottom: 0, left: 0, right: 0 }}
          x={mouse.current.x}
          y={0}
          interactive
        >
          <Box
            sx={{
              display: "flex",
              marginBottom: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="heading6">URL</Text>
            <Text variant="meta" color="success">
              {hasCopied
                ? t({ id: "share.url-copied", message: "URL kopiert ✅" })
                : ""}
            </Text>
          </Box>
          <Box
            sx={{
              borderStyle: "solid",
              boxSizing: "border-box",
              borderWidth: 1,
              borderColor: "monochrome500",
              outline: hasInputFocus ? "2px solid" : "none",
              outlineColor: "primary",
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <Input
              onFocus={setFocusOn}
              onBlur={setFocusOff}
              sx={{
                width: 300,
                border: "none",
                height: "100%",
                "&:focus": { border: "none", outline: 0 },
              }}
              value={window.location.toString()}
            ></Input>
            <Button
              onClick={handleClickCopyButton}
              sx={{
                width: "3rem",
                height: "3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "monochrome300",
                color: "monochrome900",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "monochrome400",
                },
                "&:focus, &:active": {
                  outline: 0,
                },
              }}
            >
              <IconCopy />
            </Button>
          </Box>
        </TooltipBox>
      ) : null}
    </>
  );
};

const IndexPage = ({ locale }: Props) => {
  const [{ period, priceComponent, category, product, download }] =
    useQueryStateSingle();

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

  const [municipalitiesQuery] = useAllMunicipalitiesQuery({
    variables: {
      locale,
    },
  });

  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.observations ?? EMPTY_ARRAY;
  const cantonMedianObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cantonMedianObservations ?? EMPTY_ARRAY;
  const swissMedianObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.swissMedianObservations ?? EMPTY_ARRAY;

  const municipalities =
    municipalitiesQuery.data?.municipalities ?? EMPTY_ARRAY;

  const medianValue = swissMedianObservations[0]?.value;

  const colorAccessor = useCallback((d) => d.value, []);
  const colorScale = useColorScale({
    observations,
    medianValue,
    accessor: colorAccessor,
  });

  const { push, query } = useRouter();

  const handleMunicipalityLayerClick = ({
    object,
  }: {
    object: { id: number };
  }) => {
    const href = {
      pathname: "/municipality/[id]",
      query: {
        ...query,
        id: object?.id.toString(),
      },
    };
    push(href);
  };

  const [highlightContext, setHighlightContext] = useState<HighlightValue>();
  return (
    <HighlightContext.Provider
      value={{
        value: highlightContext,
        setValue: setHighlightContext,
      }}
    >
      <Head>
        <title>{t({ id: "site.title" })}</title>
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
          <Header />
        </Box>
        <Box
          sx={{
            position: "relative",
          }}
        >
          <InfoBanner />
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
              gridTemplateAreas: [`"map" "controls"`, `"map controls"`],
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
                observations={observations}
                municipalities={municipalities}
                observationsQueryFetching={
                  observationsQuery.fetching || municipalitiesQuery.fetching
                }
                medianValue={medianValue}
                colorScale={colorScale}
                onMunicipalityLayerClick={handleMunicipalityLayerClick}
              />

              {!download && (
                <Box
                  sx={{
                    zIndex: 13,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    mb: 0,
                    ml: 3,
                    px: 3,
                    py: 4,
                    background: "rgba(255, 255, 255, 0.85)",
                    display: "flex",
                    gap: "2rem",
                  }}
                >
                  <DownloadImage
                    elementId={DOWNLOAD_ID}
                    fileName={DOWNLOAD_ID}
                    downloadType={DOWNLOAD_ID}
                  />
                  <ShareButton />
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
                cantonObservations={cantonMedianObservations}
                colorScale={colorScale}
                observationsQueryFetching={observationsQuery.fetching}
              />
            </Box>
          </Grid>
        </Box>
        <Footer />
      </Grid>
    </HighlightContext.Provider>
  );
};

export default IndexPage;
