import { Box, paperClasses } from "@mui/material";
import { median } from "d3";
import { keyBy, property } from "lodash";
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

import { CombinedSelectors } from "src/components/combined-selectors";
import { DownloadImage } from "src/components/detail-page/download-image";
import { InfoBanner } from "src/components/info-banner";
import { List } from "src/components/list";
import { ChoroplethMap, ChoroplethMapProps } from "src/components/map";
import { MapProvider } from "src/components/map-context";
import OperatorsMap from "src/components/operators-map";
import ShareButton from "src/components/share-button";
import { NetworkLevel, TariffCategory, useColorScale } from "src/domain/data";
import {
  PriceComponent,
  SunshineDataRow,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
  useSunshineDataQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { truthy } from "src/lib/truthy";
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

const isDefined = (x: number | undefined | null): x is number =>
  x !== undefined && x !== null;

const accessorsByAttribute: Record<
  string,
  (x: SunshineDataRow) => number | undefined
> = {
  saidiTotal: property("saidiTotal"),
  saidiUnplanned: property("saidiUnplanned"),
  saidiPlanned: (x) => {
    if (isDefined(x.saidiTotal) && isDefined(x.saidiUnplanned)) {
      return x.saidiTotal - x.saidiUnplanned;
    }
  },
  saifiTotal: property("saifiTotal"),
  saifiUnplanned: property("saifiUnplanned"),
  saifiPlanned: (x) => {
    if (isDefined(x.saifiTotal) && isDefined(x.saifiUnplanned)) {
      return x.saifiTotal - x.saifiUnplanned;
    }
  },
  networkCostsNE5: property("networkCostsNE5"),
  networkCostsNE6: property("networkCostsNE6"),
  networkCostsNE7: property("networkCostsNE7"),

  tariffEC2: property("tariffEC2"),
  tariffEC3: property("tariffEC3"),
  tariffEC4: property("tariffEC4"),
  tariffEC6: property("tariffEC6"),
  tariffEH2: property("tariffEH2"),
  tariffEH4: property("tariffEH4"),
  tariffEH7: property("tariffEH7"),
  tariffNC2: property("tariffNC2"),
  tariffNC3: property("tariffNC3"),
  tariffNC4: property("tariffNC4"),
  tariffNC6: property("tariffNC6"),
  tariffNH2: property("tariffNH2"),
  tariffNH4: property("tariffNH4"),
  tariffNH7: property("tariffNH7"),
};

function getSunshineAccessor(
  indicator: string,
  typology: string,
  networkLevel: NetworkLevel["id"],
  netTariffCategory: TariffCategory,
  energyTariffCategory: TariffCategory
): (r: SunshineDataRow) => number | undefined {
  if (indicator === "saidi" || indicator === "saifi") {
    return typology === "total"
      ? accessorsByAttribute[`${indicator}Total`]
      : typology === "unplanned"
      ? accessorsByAttribute[`${indicator}Unplanned`]
      : accessorsByAttribute[`${indicator}Planned`];
  }
  if (indicator === "networkCosts") {
    return accessorsByAttribute[`networkCosts${networkLevel}`];
  }
  if (indicator === "netTariffs") {
    return accessorsByAttribute[`tariff${netTariffCategory}`];
  }
  if (indicator === "energyTariffs") {
    return accessorsByAttribute[`tariff${energyTariffCategory}`];
  }
  throw new Error("Invalid indicator: " + indicator);
}

const IndexPage = ({ locale }: Props) => {
  const [
    {
      period,
      priceComponent,
      category,
      product,
      download,
      tab = "electricity",
      typology,
      indicator,
      networkLevel,
      netTariffCategory,
      energyTariffCategory,
    },
  ] = useQueryStateSingle();
  const [activeId, setActiveId] = useState<string | null>(null);
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
                bgcolor: "background.paper",
                border: "1x solid green",
                maxHeight: `calc(100vh - ${HEADER_HEIGHT_UP})`,
              }}
            >
              <CombinedSelectors />
              {isElectricityTab ? (
                <List
                  observations={observations}
                  cantonObservations={cantonMedianObservations}
                  colorScale={colorScale}
                  observationsQueryFetching={
                    isElectricityTab
                      ? observationsQuery.fetching
                      : sunshineDataQuery.fetching
                  }
                />
              ) : null}
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
            <CombinedSelectors />
            <List
              observations={observations}
              cantonObservations={cantonMedianObservations}
              colorScale={colorScale}
              observationsQueryFetching={
                isElectricityTab
                  ? observationsQuery.fetching
                  : sunshineDataQuery.fetching
              }
            />
          </Box>
        </Box>
      </ApplicationLayout>
    </MapProvider>
  );
};

export default IndexPage;
