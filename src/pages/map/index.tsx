import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { ScaleThreshold } from "d3";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

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
import ShareButton from "src/components/share-button";
import { SunshineDataServiceDebug } from "src/components/sunshine-data-service-debug";
import SunshineMap from "src/components/sunshine-map";
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
import { PriceComponent, SunshineDataIndicatorRow } from "src/graphql/queries";
import { useEnrichedEnergyPricesData } from "src/hooks/use-enriched-energy-prices-data";
import { useEnrichedSunshineData } from "src/hooks/use-enriched-sunshine-data";
import { useSelectedEntityData } from "src/hooks/use-selected-entity-data";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { getSunshineDataServiceInfo } from "src/lib/sunshine-data-service-context";
import { useIsMobile } from "src/lib/use-mobile";
import { defaultLocale } from "src/locales/config";
import { useFlag } from "src/utils/flags";

const MobileControls = dynamic(
  () => import("src/components/map/mobile-controls").then((mod) => mod),
  { ssr: false }
);

const MapDetailsContent = dynamic(
  () =>
    import("src/components/map-details-content").then(
      (mod) => mod.MapDetailsContent
    ),
  { ssr: false }
);

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

const MapPageContent = ({
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

  // Entity should be part of the state
  const { entity: mapEntity, setEntity } = useMap();
  const entity = isElectricityTab ? mapEntity : "operator";

  const colorAccessor = useCallback((d: { value: number }) => d.value, []);

  // Simple accessor for sunshine data - just get the value field
  const sunshineAccessor = useCallback(
    (r: SunshineDataIndicatorRow) => r?.value ?? undefined,
    []
  );

  const hasSunshineFlag = useFlag("sunshine");

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

  const energyPricesEnrichedData = useEnrichedEnergyPricesData({
    locale: locale,
    priceComponent: priceComponent as PriceComponent,
    filters: {
      period: [period],
      category: [category],
      product: [product],
    },
    enabled: isElectricityTab,
  });

  const sunshineEnrichedDataResult = useEnrichedSunshineData({
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
    enabled: isSunshineTab,
  });

  const colorScale = useMemo(() => {
    const medianValue = isElectricityTab
      ? energyPricesEnrichedData.data?.swissMedianObservations[0]?.value
      : sunshineEnrichedDataResult.data?.median ?? undefined;
    const specKey = isElectricityTab ? "energyPrices" : indicator;
    const spec =
      specKey in colorScaleSpecs && colorScaleSpecs[specKey]
        ? colorScaleSpecs[specKey]
        : colorScaleSpecs.default;
    const isValidValue = <T extends { value?: number | null | undefined }>(
      x: T
    ): x is T & { value: number } => x.value !== undefined && x.value !== null;

    const sunshineValues = (sunshineEnrichedDataResult.data?.observations ?? [])
      .filter(isValidValue)
      .map((x) => x.value);

    const validObservations = (
      energyPricesEnrichedData.data?.observations ?? []
    ).filter(isValidValue);
    return makeColorScale(
      spec,
      medianValue,
      isElectricityTab ? validObservations.map(colorAccessor) : sunshineValues
    );
  }, [
    colorAccessor,
    energyPricesEnrichedData.data?.observations,
    energyPricesEnrichedData.data?.swissMedianObservations,
    indicator,
    isElectricityTab,
    sunshineEnrichedDataResult.data?.median,
    sunshineEnrichedDataResult.data?.observations,
  ]);

  const map = isElectricityTab ? (
    <EnergyPricesMap
      enrichedDataQuery={energyPricesEnrichedData}
      colorScale={colorScale}
      controls={controlsRef}
      period={period}
      priceComponent={priceComponent as PriceComponent}
    />
  ) : (
    <SunshineMap
      enrichedDataResult={sunshineEnrichedDataResult}
      colorScale={colorScale}
      accessor={sunshineAccessor}
      valueFormatter={valueFormatter}
      controls={controlsRef}
      period={period}
      indicator={indicator}
    />
  );

  const listGroups = useMemo(() => {
    if (isElectricityTab) {
      const observations =
        energyPricesEnrichedData.data?.observations ?? EMPTY_ARRAY;
      return entity === "canton"
        ? groupsFromCantonElectricityObservations(
            energyPricesEnrichedData.data?.cantonMedianObservations ??
              EMPTY_ARRAY
          )
        : entity === "operator"
        ? groupsFromElectricityOperators(observations)
        : groupsFromElectricityMunicipalities(observations);
    } else {
      return groupsFromSunshineObservations(
        sunshineEnrichedDataResult.data?.observations ?? EMPTY_ARRAY
      );
    }
  }, [
    isElectricityTab,
    energyPricesEnrichedData.data?.observations,
    energyPricesEnrichedData.data?.cantonMedianObservations,
    entity,
    sunshineEnrichedDataResult.data?.observations,
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
          ? energyPricesEnrichedData.fetching
          : sunshineEnrichedDataResult.fetching
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

  const shouldShowInfoBanner = !!(
    energyPricesEnrichedData.fetching === false &&
    energyPricesEnrichedData.data &&
    !energyPricesEnrichedData.data.medianValue
  );

  const selectedEntityData = useSelectedEntityData({
    dataType: isElectricityTab ? "energy-prices" : "sunshine",
    enrichedData: isElectricityTab
      ? energyPricesEnrichedData.data
      : sunshineEnrichedDataResult.data,
    selection: {
      selectedId: selectedItem?.id ?? null,
      hoveredId: null,
      entityType: entity,
    },
    colorScale,
    formatValue: valueFormatter,
    priceComponent: priceComponent,
  });

  return (
    <>
      <ApplicationLayout>
        <InfoBanner bypassBannerEnabled={shouldShowInfoBanner} />
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
                  maxHeight: "70vh",
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
                  "--selector-panel-padding-x": (theme) => theme.spacing(6),
                }}
                data-testid="map-sidebar"
              >
                {desktopDetailsDrawer}
                {selectedItem ? null : (
                  <>
                    <CombinedSelectors
                      sx={{
                        px: `var(--selector-panel-padding-x)`,
                      }}
                    />
                    <Box
                      sx={{
                        px: `var(--selector-panel-padding-x)`,
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
              listButtonGroup={listButtonGroup}
              details={mobileDetailsContent}
              selectors={<CombinedSelectors />}
              entity={entity}
              selectedEntityData={selectedEntityData}
            />
          )}
        </Box>
      </ApplicationLayout>
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

export const MapPage = ({ locale, dataService }: Props) => {
  const [{ activeId }, setQueryState] = useQueryStateMapCommon();
  const setActiveId = useCallback(
    (id: string | null) => {
      setQueryState({ activeId: id });
    },
    [setQueryState]
  );

  return (
    <MapProvider activeId={activeId} setActiveId={setActiveId}>
      <Head>
        <title>
          {t({
            id: "site.title",
            message: "Electricity tariffs in Switzerland",
          })}
        </title>
      </Head>
      {!dataService.isDefault && (
        <SunshineDataServiceDebug serviceName={dataService.serviceName} />
      )}
      <MapPageContent locale={locale} activeId={activeId} />
    </MapProvider>
  );
};

export default MapPage;
