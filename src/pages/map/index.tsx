import { t } from "@lingui/macro";
import { Box, paperClasses } from "@mui/material";
import { median, ScaleThreshold } from "d3";
import { keyBy } from "lodash";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);

import { ButtonGroup } from "src/components/button-group";
import { CombinedSelectors } from "src/components/combined-selectors";
import { DownloadImage } from "src/components/detail-page/download-image";
import { InlineDrawer } from "src/components/drawer";
import { InfoBanner } from "src/components/info-banner";
import {
  getEntityFromListState,
  groupsFromCantonElectricityObservations,
  groupsFromElectricityMunicipalities,
  groupsFromElectricityOperators,
  groupsFromSunshineObservations,
  List,
  ListItemType,
} from "src/components/list";
import { ChoroplethMap, ChoroplethMapProps } from "src/components/map";
import { ListState, MapProvider, useMap } from "src/components/map-context";
import { MapDetailsContent } from "src/components/map-details-content";
import OperatorsMap from "src/components/operators-map";
import ShareButton from "src/components/share-button";
import {
  Entity,
  NetworkLevel,
  TariffCategory,
  useColorScale,
} from "src/domain/data";
import { getSunshineAccessor } from "src/domain/sunshine-accessor";
import {
  PriceComponent,
  SunshineDataRow,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
  useSunshineDataQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { truthy } from "src/lib/truthy";
import {
  useQueryStateSingleElectricity,
  useQueryStateSingleSunshine,
} from "src/lib/use-query-state";
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

const IndexPageContent = ({
  locale,
  activeId,
}: Props & { activeId: string | null }) => {
  const [
    {
      period,
      priceComponent,
      category,
      product,
      download,
      tab = "electricity",
    },
  ] = useQueryStateSingleElectricity();

  const [
    {
      typology,
      indicator,
      networkLevel,
      netTariffCategory,
      energyTariffCategory,
    },
  ] = useQueryStateSingleSunshine();

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

  const [sunshineDataQuery] = useSunshineDataQuery({
    variables: {
      filter: { period: period || "2024" },
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
      : sunshineDataQuery.data?.sunshineData ?? EMPTY_ARRAY;
  }, [sunshineDataQuery.data?.sunshineData, sunshineDataQuery.fetching]);

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
  const sunshineAccessor = useMemo<
    (r: SunshineDataRow) => number | undefined
  >(() => {
    return getSunshineAccessor(
      indicator,
      typology,
      networkLevel as NetworkLevel["id"],
      netTariffCategory as TariffCategory,
      energyTariffCategory as TariffCategory
    );
  }, [
    indicator,
    typology,
    networkLevel,
    netTariffCategory,
    energyTariffCategory,
  ]);

  const sunshineValues = sunshineObservations
    .map((x) => sunshineAccessor(x) ?? null)
    .filter((x) => x !== null);

  const medianValue = isElectricityTab
    ? swissMedianObservations[0]?.value
    : // TODO
      median(sunshineValues);
  const colorScale = useColorScale({
    observations,
    medianValue,
    accessor: colorAccessor,
  });

  const sunshineColorScale = useColorScale({
    observations: sunshineObservations,
    medianValue,
    accessor: sunshineAccessor,
  });

  const isSunshine = useFlag("sunshine");

  // Determine the data field to use for the map based on the active tab and indicator
  const mapYear = period;

  // Determine if the map data is loading
  const isMapDataLoading = isElectricityTab
    ? observationsQuery.fetching || municipalitiesQuery.fetching
    : sunshineDataQuery.fetching || municipalitiesQuery.fetching;

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

  const sunshineValuesByOperator = useMemo(() => {
    return keyBy(sunshineObservations, "operatorId");
  }, [sunshineObservations]);

  const map = isElectricityTab ? (
    <ChoroplethMap
      year={mapYear}
      observations={observations}
      municipalities={municipalities}
      observationsQueryFetching={isMapDataLoading}
      onMunicipalityLayerClick={() => {}}
      medianValue={medianValue}
      colorScale={colorScale}
      controls={controlsRef}
    />
  ) : (
    <OperatorsMap
      accessor={sunshineAccessor}
      period={mapYear}
      colorScale={sunshineColorScale}
      observations={sunshineObservations}
      getTooltip={(info) => {
        if (!info.object) {
          return null;
        }
        const operatorIds = info.object.properties?.operators;
        const values = operatorIds
          .map((x) => {
            const op = sunshineValuesByOperator[x];
            if (!op) {
              return undefined;
            }
            return {
              label: op.name,
              value: sunshineAccessor(op),
            };
          })
          .filter(truthy);
        const html = `<div class="${paperClasses.root}">${values
          .map((x) => {
            return `<strong>${x.label}</strong>: ${
              x.value?.toFixed(2) ?? "N/A"
            }`;
          })
          .join("<br/>")}</div>`;
        return {
          html,
        };
      }}
    />
  );

  const { listState, setListState } = useMap();

  const listGroups = useMemo(() => {
    if (isElectricityTab) {
      return listState === "CANTONS"
        ? groupsFromCantonElectricityObservations(cantonMedianObservations)
        : listState === "OPERATORS"
        ? groupsFromElectricityOperators(observations)
        : groupsFromElectricityMunicipalities(observations);
    } else {
      return groupsFromSunshineObservations(
        sunshineObservations,
        sunshineAccessor
      );
    }
  }, [
    isElectricityTab,
    listState,
    cantonMedianObservations,
    observations,
    sunshineObservations,
    sunshineAccessor,
  ]);

  const list = (
    <List
      listState={isElectricityTab ? listState : "OPERATORS"}
      grouped={listGroups}
      colorScale={colorScale}
      fetching={
        isElectricityTab
          ? observationsQuery.fetching
          : sunshineDataQuery.fetching
      }
    />
  );

  const listButtonGroup = isElectricityTab ? (
    <ButtonGroup<ListState>
      id="list-state-tabs"
      options={[
        {
          value: "MUNICIPALITIES",
          label: t({
            id: "list.municipalities",
            message: "Municipalities",
          }),
        },
        {
          value: "CANTONS",
          label: t({ id: "list.cantons", message: "Cantons" }),
        },
        {
          value: "OPERATORS",
          label: t({
            id: "list.operators",
            message: "Network operator",
          }),
        },
      ]}
      value={listState}
      label={t({
        id: "list.viewby.label",
        message: "View according to",
      })}
      setValue={setListState}
    />
  ) : null;

  const detailsDrawer = (
    <DetailsDrawer
      items={listGroups}
      colorScale={isElectricityTab ? colorScale : sunshineColorScale}
      entity={getEntityFromListState(listState)}
    />
  );

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

          <ContentWrapper
            sx={{
              display: { xxs: "none", md: "grid" },
              gridTemplateColumns: "22.5rem 1fr",
              gap: 0,
            }}
          >
            <Box
              sx={{
                height: "100%",
                overflowY: "auto",
                position: "relative",
                bgcolor: "background.paper",
                border: "1x solid green",
                maxHeight: `calc(100vh - ${HEADER_HEIGHT_UP})`,
              }}
            >
              {detailsDrawer}
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
            {detailsDrawer}
            <CombinedSelectors />
            {list}
          </Box>
        </Box>
      </ApplicationLayout>
    </>
  );
};

const DetailsDrawer = ({
  items,
  colorScale,
  entity,
}: {
  items: [string, ListItemType][];
  colorScale: ScaleThreshold<number, string, never>;
  entity: Entity;
}) => {
  const { activeId, setActiveId } = useMap();
  const selectedItem = useMemo(() => {
    if (activeId) {
      const selected = items.find(([itemId]) => itemId === activeId);
      return selected?.[1] ?? null;
    }
  }, [activeId, items]);

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

export const IndexPage = ({ locale }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <MapProvider activeId={activeId} setActiveId={setActiveId}>
      <IndexPageContent locale={locale} activeId={activeId} />
    </MapProvider>
  );
};

export default IndexPage;
