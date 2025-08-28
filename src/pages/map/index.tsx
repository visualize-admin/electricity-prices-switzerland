import { t, Trans } from "@lingui/macro";
import {
  Box,
  Card,
  CardContent,
  createTheme,
  IconButton,
  Tab,
  Tabs,
  Theme,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { ScaleThreshold } from "d3";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Vaul from "vaul";

import { CombinedSelectors } from "src/components/combined-selectors";
import { Combobox } from "src/components/combobox";
import { DownloadImage } from "src/components/detail-page/download-image";
import { InlineDrawer } from "src/components/drawer";
import {
  EnergyPricesMap,
  EnergyPricesMapProps,
} from "src/components/energy-prices-map";
import { InfoBanner } from "src/components/info-banner";
import {
  groupsFromCantonElectricityObservations,
  groupsFromElectricityMunicipalities,
  groupsFromElectricityOperators,
  groupsFromSunshineObservations,
  List,
  ListItemType,
} from "src/components/list";
import { MapProvider, useMap } from "src/components/map-context";
import { MapDetailsContent } from "src/components/map-details-content";
import ShareButton from "src/components/share-button";
import { SunshineDataServiceDebug } from "src/components/sunshine-data-service-debug";
import SunshineMap from "src/components/sunshine-map";
import useVaulStyles from "src/components/useVaulStyles";
import { DataServiceProps } from "src/data/shared-page-props";
import { colorScaleSpecs, makeColorScale } from "src/domain/charts";
import { Entity, ElectricityCategory } from "src/domain/data";
import { useIndicatorValueFormatter } from "src/domain/helpers";
import {
  useQueryStateEnergyPricesMap,
  useQueryStateMapCommon,
  useQueryStateSunshineMap,
} from "src/domain/query-states";
import { NetworkLevel } from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";
import {
  PriceComponent,
  SunshineDataIndicatorRow,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
  useSunshineDataByIndicatorQuery,
} from "src/graphql/queries";
import { Icon } from "src/icons";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { getSunshineDataServiceInfo } from "src/lib/sunshine-data-service-context";
import { useIsMobile } from "src/lib/use-mobile";
import { defaultLocale } from "src/locales/config";
import { useFlag } from "src/utils/flags";

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
const HEADER_HEIGHT_UP = "144px";

type Props = {
  locale: string;
  dataService: DataServiceProps;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string }
> = async (context) => {
  const { locale } = context;
  const dataService = getSunshineDataServiceInfo(context);
  return { props: { locale: locale ?? defaultLocale, dataService } };
};

const IndexPageContent = ({
  locale,
  activeId,
}: Omit<Props, "dataService"> & { activeId: string | null }) => {
  const [
    {
      period,
      priceComponent,
      category,
      product,
      download,
      tab = "electricity",
    },
  ] = useQueryStateEnergyPricesMap();

  const [
    {
      typology,
      indicator,
      networkLevel,
      category: netElectricityCategory,
      category: energyElectricityCategory,
      peerGroup,
    },
  ] = useQueryStateSunshineMap();

  const isElectricityTab = tab === "electricity";
  const isSunshineTab = tab === "sunshine";

  const [observationsQuery] = useObservationsQuery({
    variables: {
      locale,
      priceComponent: priceComponent as PriceComponent,
      filters: { period: [period], category: [category], product: [product] },
    },
    pause: !isElectricityTab,
  });

  const [sunshineDataQuery] = useSunshineDataByIndicatorQuery({
    variables: {
      filter: {
        period: period || "2024",
        peerGroup: peerGroup === "all_grid_operators" ? undefined : peerGroup,
        indicator,
        typology,
        networkLevel: networkLevel as NetworkLevel["id"],
        category:
          (netElectricityCategory as ElectricityCategory) ||
          (energyElectricityCategory as ElectricityCategory),
      },
    },
    pause: !isSunshineTab,
  });

  const [municipalitiesQuery] = useAllMunicipalitiesQuery({
    variables: { locale },
  });
  // Get the right data based on the active tab and indicator
  const observations = useMemo(() => {
    return observationsQuery.fetching
      ? EMPTY_ARRAY
      : observationsQuery.data?.observations ?? EMPTY_ARRAY;
  }, [observationsQuery.data?.observations, observationsQuery.fetching]);

  const sunshineObservations = useMemo(() => {
    return sunshineDataQuery.fetching
      ? EMPTY_ARRAY
      : sunshineDataQuery.data?.sunshineDataByIndicator?.data ?? EMPTY_ARRAY;
  }, [
    sunshineDataQuery.data?.sunshineDataByIndicator?.data,
    sunshineDataQuery.fetching,
  ]);

  const cantonMedianObservations = isElectricityTab
    ? observationsQuery.fetching
      ? EMPTY_ARRAY
      : observationsQuery.data?.cantonMedianObservations ?? EMPTY_ARRAY
    : EMPTY_ARRAY;

  const swissMedianObservations = isElectricityTab
    ? observationsQuery.fetching
      ? EMPTY_ARRAY
      : observationsQuery.data?.swissMedianObservations ?? EMPTY_ARRAY
    : EMPTY_ARRAY;
  const municipalities =
    municipalitiesQuery.data?.municipalities ?? EMPTY_ARRAY;

  const colorAccessor = useCallback((d: { value: number }) => d.value, []);

  // Simple accessor for sunshine data - just get the value field
  const sunshineAccessor = useCallback(
    (r: SunshineDataIndicatorRow) => r?.value ?? undefined,
    []
  );

  const medianValue = isElectricityTab
    ? swissMedianObservations[0]?.value
    : sunshineDataQuery.data?.sunshineDataByIndicator?.median ?? undefined;

  const colorScale = useMemo(() => {
    const specKey = isElectricityTab ? "energyPrices" : indicator;
    const spec =
      specKey in colorScaleSpecs && colorScaleSpecs[specKey]
        ? colorScaleSpecs[specKey]
        : colorScaleSpecs.default;
    const isValidValue = <T extends { value?: number | null | undefined }>(
      x: T
    ): x is T & { value: number } => x.value !== undefined && x.value !== null;

    const sunshineValues = sunshineObservations
      .filter(isValidValue)
      .map((x) => x.value);

    const validObservations = observations.filter(isValidValue);
    return makeColorScale(
      spec,
      medianValue,
      isElectricityTab ? validObservations.map(colorAccessor) : sunshineValues
    );
  }, [
    colorAccessor,
    indicator,
    isElectricityTab,
    medianValue,
    observations,
    sunshineObservations,
  ]);

  const hasSunshineFlag = useFlag("sunshine");

  // Determine the data field to use for the map based on the active tab and indicator
  const mapYear = period;

  // Determine if the map data is loading
  const isMapDataLoading = isElectricityTab
    ? observationsQuery.fetching || municipalitiesQuery.fetching
    : sunshineDataQuery.fetching || municipalitiesQuery.fetching;

  const controlsRef: NonNullable<EnergyPricesMapProps["controls"]> =
    useRef(null);

  useEffect(() => {
    if (hasSunshineFlag) {
      try {
        if (activeId) {
          controlsRef.current?.zoomOn(activeId);
        } else {
          controlsRef.current?.zoomOut();
        }
      } catch (e) {
        console.error("Error zooming on map:", e);
      }
    }
  }, [activeId, hasSunshineFlag]);

  const valueFormatter = useIndicatorValueFormatter(indicator);

  const coverageRatioFlag = useFlag("coverageRatio");
  const mapObservations = coverageRatioFlag
    ? observations.filter((x) => {
        return x.coverageRatio !== 1;
      })
    : observations;

  const map = isElectricityTab ? (
    <EnergyPricesMap
      year={mapYear}
      observations={mapObservations}
      municipalities={municipalities}
      priceComponent={priceComponent}
      observationsFetching={observationsQuery.fetching}
      municipalitiesFetching={municipalitiesQuery.fetching}
      observationsError={observationsQuery.error}
      municipalitiesError={municipalitiesQuery.error}
      medianValue={medianValue}
      colorScale={colorScale}
      controls={controlsRef}
    />
  ) : (
    <SunshineMap
      accessor={sunshineAccessor}
      period={mapYear}
      indicator={indicator}
      colorScale={colorScale}
      observations={sunshineObservations}
      controls={controlsRef}
      valueFormatter={valueFormatter}
      medianValue={medianValue}
      observationsQueryFetching={isMapDataLoading}
    />
  );

  const { entity: mapEntity, setEntity } = useMap();
  const entity = isElectricityTab ? mapEntity : "operator";

  const listGroups = useMemo(() => {
    if (isElectricityTab) {
      return entity === "canton"
        ? groupsFromCantonElectricityObservations(cantonMedianObservations)
        : entity === "operator"
        ? groupsFromElectricityOperators(observations)
        : groupsFromElectricityMunicipalities(observations);
    } else {
      return groupsFromSunshineObservations(sunshineObservations);
    }
  }, [
    isElectricityTab,
    entity,
    cantonMedianObservations,
    observations,
    sunshineObservations,
  ]);

  const list = (
    <List
      entity={isElectricityTab ? entity : "operator"}
      grouped={listGroups}
      colorScale={colorScale}
      indicator={indicator}
      valueFormatter={valueFormatter}
      fetching={
        isElectricityTab
          ? observationsQuery.fetching
          : sunshineDataQuery.fetching
      }
    />
  );

  const listButtonGroup = isElectricityTab ? (
    <Combobox
      id="list-state-tabs"
      label={t({
        id: "list.viewby.label",
        message: "View according to",
      })}
      items={["municipality", "canton", "operator"]}
      getItemLabel={(item) => {
        switch (item) {
          case "municipality":
            return t({
              id: "list.viewby.municipality",
              message: "Municipality",
            });
          case "canton":
            return t({ id: "list.viewby.canton", message: "Canton" });
          case "operator":
            return t({ id: "list.viewby.operator", message: "Operator" });
          default:
            return item;
        }
      }}
      selectedItem={entity}
      setSelectedItem={(item) => {
        return setEntity(item as Entity);
      }}
    />
  ) : null;

  const selectedItem = useMemo(() => {
    if (activeId) {
      const selected = listGroups.find(([itemId]) => itemId === activeId);
      return selected?.[1] ?? null;
    }
  }, [activeId, listGroups]);
  const { setActiveId } = useMap();

  const mobileDetailsContent = selectedItem ? (
    <MapDetailsContent
      colorScale={colorScale}
      entity={entity}
      selectedItem={selectedItem}
      onBack={() => setActiveId(null)}
    />
  ) : null;

  const desktopDetailsDrawer = (
    <DetailsDrawer
      selectedItem={selectedItem}
      colorScale={colorScale}
      entity={entity}
    />
  );

  const isMobile = useIsMobile();

  return (
    <>
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
                {map}
              </Box>
            </ContentWrapper>
          </Box>

          {isMobile ? null : (
            <Box
              sx={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "22.5rem 1fr",
                gap: 0,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  overflowY: "auto",
                  position: "relative",
                  bgcolor: "background.paper",
                  borderRight: "1px solid",
                  borderColor: "divider",
                  maxHeight: `calc(100vh - ${HEADER_HEIGHT_UP})`,
                  paddingTop: "1rem",
                }}
                data-testid="map-sidebar"
              >
                {desktopDetailsDrawer}
                {selectedItem ? null : (
                  <>
                    <CombinedSelectors />
                    <Box
                      sx={{
                        px: 6,
                        flexDirection: "column",
                        gap: 4,
                      }}
                      display="flex"
                    >
                      {listButtonGroup}
                      {list}
                    </Box>
                  </>
                )}
              </Box>

              <Box
                id={DOWNLOAD_ID}
                sx={{
                  width: "100%",
                  height: `calc(100vh - ${HEADER_HEIGHT_UP})`,
                  position: "relative",
                  bgcolor: "secondary.50",
                }}
              >
                {map}
                {!download && (
                  <Box
                    sx={{
                      zIndex: 13,
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      mb: 0,
                      mr: 3,
                      p: 1,
                      backgroundColor: "background.paper",
                      display: "flex",
                      gap: 1,
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
            </Box>
          )}

          {!isMobile ? null : (
            <MobileControls
              list={list}
              details={mobileDetailsContent}
              selectors={<CombinedSelectors />}
              entity={entity}
              selectedItem={selectedItem}
            />
          )}
        </Box>
      </ApplicationLayout>
    </>
  );
};

const MobileDrawer = ({
  list,
  details,
  selectors,
  onClose,
  open,
}: {
  list: React.ReactNode;
  details: React.ReactNode;
  selectors: React.ReactNode;
  onClose?: () => void;
  open: boolean;
}) => {
  const { classes } = useVaulStyles();
  const [tab, setTab] = useState("selectors");
  const vaultContentRef = useRef<HTMLDivElement>(null);
  return (
    <ThemeProvider
      theme={(theme: Theme) =>
        createTheme({
          ...theme,
          components: {
            ...theme.components,
            MuiPopper: {
              defaultProps: {
                container: () => vaultContentRef.current,
              },
            },
          },
        })
      }
    >
      <Vaul.Root open={open} onClose={onClose}>
        <Vaul.Portal>
          <Vaul.Overlay className={classes.overlay} />
          <Vaul.Content className={classes.content} ref={vaultContentRef}>
            {/* Tabs that can select between list & selectors */}

            <div className={classes.handle} />
            <Box sx={{ overflowY: "auto", flex: 1, mx: 2 }}>
              {details ? (
                details
              ) : (
                <>
                  {" "}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 2,
                    }}
                  >
                    <Tabs
                      value={tab}
                      sx={{ mb: 6 }}
                      onChange={(event, newValue) => setTab(newValue)}
                    >
                      <Tab label="Selectors" value="selectors" />
                      <Tab label="List" value="list" />
                    </Tabs>
                  </Box>
                  {tab === "list" ? list : selectors}
                </>
              )}
            </Box>
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    </ThemeProvider>
  );
};

const MobileControls = ({
  list,
  details,
  selectors,
  selectedItem,
}: {
  list: React.ReactNode;
  details: React.ReactNode;
  selectors: React.ReactNode;
  selectedItem?: ListItemType | null;
  entity?: Entity;
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [queryState] = useQueryStateMapCommon();
  const [energyQueryState] = useQueryStateEnergyPricesMap();
  const [sunshineQueryState] = useQueryStateSunshineMap();

  const tab = queryState.tab;

  // Extract current values with defaults
  const period = energyQueryState.period || "2020";
  const priceComponent = energyQueryState.priceComponent || "total";
  const category = energyQueryState.category || "H4";
  const product = energyQueryState.product || "standard";

  // sunshine
  const sunshinePeriod = sunshineQueryState.period || "2020";
  const sunshinePeerGroup = sunshineQueryState.peerGroup || "total";
  const sunshineIndicator = sunshineQueryState.indicator || "H4";
  const sunshineNetworkLevel = sunshineQueryState.networkLevel || "standard";

  // Get localized labels for display
  const priceComponentLabel = getLocalizedLabel({ id: priceComponent });
  const categoryLabel = getLocalizedLabel({ id: category });
  const productLabel = getLocalizedLabel({ id: product });

  // Format the current status string
  const pricesCurrentStatus = `${period}, ${priceComponentLabel}, ${categoryLabel}, ${productLabel}`;
  const sunshineCurrentStatus = `${sunshinePeriod}, ${sunshineIndicator}, ${sunshinePeerGroup}, ${sunshineNetworkLevel}`;
  const selectedItemStatus = selectedItem
    ? `${selectedItem.label}, ${selectedItem.value}`
    : "No selection";
  const status = selectedItem
    ? selectedItemStatus
    : tab == "electricity"
    ? pricesCurrentStatus
    : sunshineCurrentStatus;

  return (
    <>
      <Card
        elevation={2}
        sx={{
          position: "relative",
          my: 2,
          mx: 2,
          transition: "background-color 0.3s ease",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "secondary.100",
          },
        }}
        onClick={() => setDrawerOpen(true)}
      >
        <CardContent sx={{ pb: "16px !important" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                <Trans id="selector.legend.select.parameters">
                  Parameter auswählen
                </Trans>
              </Typography>
              <Typography variant="body2">{status}</Typography>
            </Box>
            <IconButton edge="end" aria-label="edit parameters">
              <Icon name="menu" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <MobileDrawer
        list={list}
        selectors={selectors}
        details={details}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const DetailsDrawer = ({
  selectedItem,
  colorScale,
  entity,
}: {
  selectedItem: ListItemType | undefined | null;
  colorScale: ScaleThreshold<number, string, never>;
  entity: Entity;
}) => {
  const { setActiveId } = useMap();
  return (
    selectedItem && (
      <InlineDrawer open={!!selectedItem} onClose={() => setActiveId(null)}>
        <MapDetailsContent
          colorScale={colorScale}
          entity={entity}
          selectedItem={selectedItem}
          onBack={() => setActiveId(null)}
        />
      </InlineDrawer>
    )
  );
};

export const IndexPage = ({ locale, dataService }: Props) => {
  const [{ activeId }, setQueryState] = useQueryStateMapCommon();
  const setActiveId = useCallback(
    (id: string | null) => {
      setQueryState({ activeId: id });
    },
    [setQueryState]
  );

  return (
    <MapProvider activeId={activeId} setActiveId={setActiveId}>
      {!dataService.isDefault && (
        <SunshineDataServiceDebug serviceName={dataService.serviceName} />
      )}
      <IndexPageContent locale={locale} activeId={activeId} />
    </MapProvider>
  );
};

export default IndexPage;
