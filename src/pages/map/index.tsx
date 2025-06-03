import { t } from "@lingui/macro";
import { Box, Button, Input, Link, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);

import { TooltipBox } from "src/components/charts-generic/interaction/tooltip-box";
import { DownloadImage } from "src/components/detail-page/download-image";
import { ElectricitySelectors } from "src/components/electricity-selectors";
import { InfoBanner } from "src/components/info-banner";
import { List } from "src/components/list";
import { ChoroplethMap, ChoroplethMapProps } from "src/components/map";
import { MapProvider } from "src/components/map-context";
import { useDisclosure } from "src/components/use-disclosure";
import { useOutsideClick } from "src/components/use-outside-click";
import { useColorScale } from "src/domain/data";
import {
  PriceComponent,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
} from "src/graphql/queries";
import { Icon } from "src/icons";
import { copyToClipboard } from "src/lib/copy-to-clipboard";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useQueryStateSingle } from "src/lib/use-query-state";
import { defaultLocale } from "src/locales/config";
import { useFlag } from "src/utils/flags";

const ApplicationLayout = dynamic(
  () =>
    import("src/components/app-layout").then((mod) => mod.ApplicationLayout),
  { ssr: false }
);

const DOWNLOAD_ID = "map";
const HEADER_HEIGHT_UP = "144px";

type Props = {
  locale: string;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string }
> = async ({ locale }) => {
  return { props: { locale: locale ?? defaultLocale } };
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
      x: linkRect.width ?? 0,
      y: linkRect.y ?? 0,
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
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      <Link
        variant="body2"
        color="text.primary"
        ref={linkRef}
        onClick={handleClick}
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Icon name="share" size={20} />
        {t({ id: "map.share", message: "Teilen" })}
      </Link>
      {isOpen && (
        <TooltipBox
          ref={tooltipBoxRef}
          placement={{ x: "center", y: "top" }}
          margins={{ top: 0, bottom: 0, left: 0, right: 0 }}
          x={mouse.current.x}
          y={0}
          interactive
        >
          <Box
            display="flex"
            mb={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">URL</Typography>
            <Typography variant="caption" color="success">
              {hasCopied
                ? t({ id: "share.url-copied", message: "URL kopiert ✅" })
                : ""}
            </Typography>
          </Box>
          <Box
            sx={{
              borderStyle: "solid",
              boxSizing: "border-box",
              borderWidth: 1,
              borderColor: "monochrome.300",
              outline: hasInputFocus ? "2px solid" : "none",
              outlineColor: "primary.main",
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
            />
            <Button
              color="secondary"
              onClick={handleClickCopyButton}
              sx={{
                width: "3rem",
                height: "3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="duplicate" />
            </Button>
          </Box>
        </TooltipBox>
      )}
    </>
  );
};

const IndexPage = ({ locale }: Props) => {
  const [{ period, priceComponent, category, product, download }] =
    useQueryStateSingle();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [observationsQuery] = useObservationsQuery({
    variables: {
      locale,
      priceComponent: priceComponent as PriceComponent,
      filters: { period: [period], category: [category], product: [product] },
    },
  });
  const [municipalitiesQuery] = useAllMunicipalitiesQuery({
    variables: { locale },
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
  const colorAccessor = useCallback((d: { value: number }) => d.value, []);
  const colorScale = useColorScale({
    observations,
    medianValue,
    accessor: colorAccessor,
  });

  const isSunshine = useFlag("sunshine");

  const controlsRef: NonNullable<ChoroplethMapProps["controls"]> = useRef(null);

  useEffect(() => {
    if (isSunshine) {
      if (activeId) {
        controlsRef.current?.zoomOn(activeId);
      } else {
        controlsRef.current?.zoomOut();
      }
    }
  }, [activeId, isSunshine]);

  return (
    <MapProvider activeId={activeId} setActiveId={setActiveId}>
      <ApplicationLayout>
        <InfoBanner
          bypassBannerEnabled={
            !!(
              observationsQuery.fetching === false &&
              observationsQuery.data &&
              !medianValue
            )
          }
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xxs: "column", md: "row" },
            width: "100%",
            bgcolor: "secondary.50",
          }}
        >
          <Box sx={{ display: { xxs: "block", md: "none" }, width: "100%" }}>
            <ContentWrapper
              sx={{
                padding: "0px !important",
              }}
            >
              <Box
                id={DOWNLOAD_ID}
                sx={{
                  height: "100vw",
                  maxHeight: "50vh",
                  width: "100%",
                  position: "relative",
                }}
              >
                <ChoroplethMap
                  year={period}
                  observations={observations}
                  municipalities={municipalities}
                  observationsQueryFetching={
                    observationsQuery.fetching || municipalitiesQuery.fetching
                  }
                  onMunicipalityLayerClick={() => {}}
                  medianValue={medianValue}
                  colorScale={colorScale}
                  controls={controlsRef}
                />
              </Box>
            </ContentWrapper>
          </Box>

          <ContentWrapper
            sx={{
              display: { xxs: "none", md: "grid" },
              gridTemplateColumns: "22.5rem 1fr",
              gap: 0,
            }}
          >
            <Box
              sx={{
                position: "sticky",
                top: HEADER_HEIGHT_UP,
                maxHeight: `calc(100vh - ${HEADER_HEIGHT_UP})`,
                overflowY: "auto",
                bgcolor: "background.paper",
              }}
            >
              <Box
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                <ElectricitySelectors />
                <List
                  observations={observations}
                  cantonObservations={cantonMedianObservations}
                  colorScale={colorScale}
                  observationsQueryFetching={observationsQuery.fetching}
                />
              </Box>
            </Box>

            <Box
              id={DOWNLOAD_ID}
              sx={{
                top: HEADER_HEIGHT_UP,
                width: "100%",
                height: `calc(100vh - ${HEADER_HEIGHT_UP})`,
                position: "sticky",
                bgcolor: "secondary.50",
              }}
            >
              <ChoroplethMap
                year={period}
                observations={observations}
                municipalities={municipalities}
                observationsQueryFetching={
                  observationsQuery.fetching || municipalitiesQuery.fetching
                }
                onMunicipalityLayerClick={() => {}}
                medianValue={medianValue}
                colorScale={colorScale}
                controls={controlsRef}
              />
              {!download && (
                <Box
                  sx={{
                    zIndex: 13,
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    mb: 0,
                    mr: 3,
                    px: 4,
                    py: 3,
                    backgroundColor: "background.paper",
                    display: "flex",
                    gap: "2rem",
                    borderRadius: "3px 3px 0 0",
                  }}
                >
                  <ShareButton />
                  <DownloadImage
                    fileName={"map.png"}
                    downloadType={DOWNLOAD_ID}
                    getImageData={async () =>
                      controlsRef.current?.getImageData()
                    }
                  />
                </Box>
              )}
            </Box>
          </ContentWrapper>

          <Box
            sx={{
              height: `calc(100vh - ${HEADER_HEIGHT_UP})`,
              maxHeight: `calc(100vh - ${HEADER_HEIGHT_UP})`,
              overflowY: "auto",
              display: { xxs: "block", md: "none" },
              bgcolor: "background.paper",
              width: "100%",
              position: "relative",
            }}
          >
            <ElectricitySelectors />
            <List
              observations={observations}
              cantonObservations={cantonMedianObservations}
              colorScale={colorScale}
              observationsQueryFetching={observationsQuery.fetching}
            />
          </Box>
        </Box>
      </ApplicationLayout>
    </MapProvider>
  );
};

export default IndexPage;
