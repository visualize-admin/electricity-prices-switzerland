import { PickingInfo } from "@deck.gl/core/typed";
import { t } from "@lingui/macro";
import {
  Box,
  Button,
  IconButton,
  Input,
  Link,
  Typography,
} from "@mui/material";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import basicAuthMiddleware from "nextjs-basic-auth-middleware";
import { ComponentProps, useCallback, useRef } from "react";
import * as Vaul from "vaul";

import { TooltipBox } from "src/components/charts-generic/interaction/tooltip-box";
import { DownloadImage } from "src/components/detail-page/download-image";
import { ElectricitySelectors } from "src/components/electricity-selectors";
import { InfoBanner } from "src/components/info-banner";
import { List } from "src/components/list";
import { ChoroplethMap, ChoroplethMapProps } from "src/components/map";
import { useDisclosure } from "src/components/use-disclosure";
import { useOutsideClick } from "src/components/use-outside-click";
import { useStyles as useVaulStyles } from "src/components/vaul/useStyles";
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
import { defaultLocale } from "src/locales/locales";
import MobileControls from "src/pages/map/mobile-controls";

const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);

const ApplicationLayout = dynamic(
  () =>
    import("src/components/app-layout").then((mod) => mod.ApplicationLayout),
  { ssr: false }
);

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
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  return (
    <>
      <Link
        variant="body2"
        color={"text.primary"}
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
              color="secondary"
              onClick={handleClickCopyButton}
              sx={{
                width: "3rem",
                height: "3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
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

const MobileMapSearch = ({
  observations,
  cantonObservations,
  colorScale,
  observationsQueryFetching,
  onDrawerOpenChange,
  isOpen,
}: {
  observations: ComponentProps<typeof List>["observations"];
  cantonObservations: ComponentProps<typeof List>["cantonObservations"];
  observationsQueryFetching: ComponentProps<
    typeof List
  >["observationsQueryFetching"];
  colorScale: ComponentProps<typeof List>["colorScale"];
  onDrawerOpenChange: (open: boolean) => void;
  isOpen: boolean;
}) => {
  const tooltipBoxRef = useRef<HTMLDivElement>(null);

  useOutsideClick(tooltipBoxRef, () => {
    close();
  });
  const { classes } = useVaulStyles();

  return (
    <>
      <Vaul.Root open={isOpen} onOpenChange={onDrawerOpenChange}>
        <Vaul.Portal>
          <Vaul.Overlay className={classes.overlay} />
          <Vaul.Content className={classes.content}>
            <div className={classes.handle} />
            <Box sx={{ overflowY: "auto", flex: 1 }}>
              <List
                observations={observations}
                cantonObservations={cantonObservations}
                colorScale={colorScale}
                observationsQueryFetching={observationsQueryFetching}
              />
            </Box>
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
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
      pathname: "/details/municipality/[id]",
      query: {
        ...query,
        id: object?.id.toString(),
      },
    };
    push(href);
  };

  const controlsRef: NonNullable<ChoroplethMapProps["controls"]> = useRef(null);
  const { isOpen, setIsOpen: onDrawerOpenChange } = useDisclosure();

  return (
    <>
      <InfoBanner
        bypassBannerEnabled={
          !!(
            observationsQuery.fetching === false &&
            observationsQuery.data &&
            !medianValue
          )
        }
      />
      <ApplicationLayout>
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
                gridTemplateAreas: [`"map" "controls"`, `"controls map"`, null],
                gap: 0,
                position: "relative",
              }}
            >
              {/* Desktop controls */}
              <Box
                sx={{
                  gridArea: "controls",
                  position: "sticky",
                  display: ["none", "block"],
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
                sx={{
                  gridArea: "controls",
                  pt: 1,
                }}
              >
                <MobileControls />
              </Box>

              {/* Map */}
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
                {/*  */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "1rem",
                    left: "0rem",
                    zIndex: 1,
                  }}
                >
                  <IconButton
                    onClick={() => onDrawerOpenChange(true)}
                    sx={{
                      backgroundColor: "background.paper",
                      borderRadius: "50%",
                      width: "3rem",
                      height: "3rem",
                      display: ["flex", "none"],
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: 1,
                    }}
                  >
                    <Icon name="search" />
                  </IconButton>
                </Box>

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
                      getImageData={async () => {
                        return controlsRef.current?.getImageData();
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </ContentWrapper>
          <MobileMapSearch
            onDrawerOpenChange={onDrawerOpenChange}
            observations={observations}
            cantonObservations={cantonMedianObservations}
            colorScale={colorScale}
            observationsQueryFetching={observationsQuery.fetching}
            isOpen={isOpen}
          />
        </Box>
      </ApplicationLayout>
    </>
  );
};

export default IndexPage;
