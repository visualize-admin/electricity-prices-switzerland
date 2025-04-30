import { PickingInfo } from "@deck.gl/core/typed";
import { t } from "@lingui/macro";
import { Box, Button, Input, Link, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import basicAuthMiddleware from "nextjs-basic-auth-middleware";
import { useCallback, useRef } from "react";

import { TooltipBox } from "src/components/charts-generic/interaction/tooltip-box";
import { DownloadImage } from "src/components/detail-page/download-image";
import { ElectricitySelectors } from "src/components/electricity-selectors";
import { List } from "src/components/list";
import { ChoroplethMap, ChoroplethMapProps } from "src/components/map";
import { useDisclosure } from "src/components/use-disclosure";
import { useOutsideClick } from "src/components/use-outside-click";
import { useColorScale } from "src/domain/data";
import {
  PriceComponent,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
} from "src/graphql/queries";
import { copyToClipboard } from "src/lib/copy-to-clipboard";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useQueryStateSingle } from "src/lib/use-query-state";
import { defaultLocale } from "src/locales/locales";

import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import { Icon } from "src/icons";
import { ApplicationLayout } from "../app-layout";

const DOWNLOAD_ID = "map";

type Props = {
  locale: string;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string }
> = async ({ locale, req, res }) => {
  await basicAuthMiddleware(req, res);

  return {
    props: {
      locale: locale ?? defaultLocale,
    },
  };
};

const HEADER_HEIGHT_UP = "144px";

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
      x: linkRect.x ?? 0 + (linkRect.width ?? 0) / 2,
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
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  return (
    <>
      <Link variant="body2" ref={linkRef} onClick={handleClick}>
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
                backgroundColor: "grey.300",
                color: "grey.900",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "grey.400",
                },
                "&:focus, &:active": {
                  outline: 0,
                },
              }}
            >
              <Icon name="duplicate" />
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

  const colorAccessor = useCallback((d: { value: number }) => d.value, []);
  const colorScale = useColorScale({
    observations,
    medianValue,
    accessor: colorAccessor,
  });

  const { push, query } = useRouter();

  const handleMunicipalityLayerClick = ({ object }: PickingInfo) => {
    const href = {
      pathname: "/municipality/[id]",
      query: {
        ...query,
        id: object?.id.toString(),
      },
    };
    push(href);
  };

  const controlsRef: NonNullable<ChoroplethMapProps["controls"]> = useRef(null);

  return (
    <ApplicationLayout locale={locale}>
      <Box
        sx={{
          backgroundColor: "secondary.50",
        }}
      >
        <ContentWrapper>
          <Box
            sx={{
              display: "grid",
              width: "100%",
              gridTemplateColumns: ["1fr", "20rem", null],
              gridTemplateAreas: [`"controls" "map"`, `"controls map"`, null],
              gap: 0,
              position: "relative",
            }}
          >
            <Box
              sx={{
                gridArea: "controls",
                position: "sticky",
                top: HEADER_HEIGHT_UP,
                maxHeight: `calc(100vh - ${HEADER_HEIGHT_UP})`,
                overflowY: "auto",
                bgcolor: "background.paper",
                zIndex: 2,
                minWidth: "22.5rem",
              }}
            >
              <Box>
                <ElectricitySelectors />
              </Box>
              <List
                observations={observations}
                cantonObservations={cantonMedianObservations}
                colorScale={colorScale}
                observationsQueryFetching={observationsQuery.fetching}
              />
            </Box>

            <Box
              id={DOWNLOAD_ID}
              sx={{
                bgcolor: "secondary.50",
                top: [0, HEADER_HEIGHT_UP],
                width: "100%",
                gridArea: "map",
                height: ["70vw", `calc(100vh - ${HEADER_HEIGHT_UP})`],
                maxHeight: ["50vh", "100vh"],
                position: ["relative", "sticky"],
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
                controls={controlsRef}
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
                    background: "rgba(245,245,245,0.8)",
                    display: "flex",
                    gap: "2rem",
                    borderRadius: "3px 3px 0 0",
                  }}
                >
                  <DownloadImage
                    fileName={"map.png"}
                    downloadType={DOWNLOAD_ID}
                    getImageData={async () => {
                      return controlsRef.current?.getImageData();
                    }}
                  />
                  <ShareButton />
                </Box>
              )}
            </Box>
          </Box>
        </ContentWrapper>
      </Box>
    </ApplicationLayout>
  );
};

export default IndexPage;
