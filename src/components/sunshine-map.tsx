import { Layer, PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayerProps } from "@deck.gl/layers/typed";
import { t } from "@lingui/macro";
import { extent, ScaleThreshold } from "d3";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { useCallback, useId, useMemo, useState } from "react";

import { MapColorLegend } from "src/components/color-legend";
import {
  GenericMap,
  GenericMapControls,
  GenericMapProps,
} from "src/components/generic-map";
import { HighlightValue } from "src/components/highlight-context";
import { getInfoDialogProps } from "src/components/info-dialog-props";
import { useMap } from "src/components/map-context";
import { HoverState, MapRenderMode } from "src/components/map-helpers";
import {
  makeCantonsLayer,
  makeLakesLayer,
  makeMunicipalityLayer,
  makeOperatorLayer,
  makeOperatorPickableLayer,
} from "src/components/map-layers";
import { SelectedEntityCard } from "src/components/map-tooltip";
import {
  isOperatorFeature,
  OperatorFeature,
  OperatorLayerProperties,
  useGeoData,
} from "src/data/geo";
import { ElectricityCategory, ValueFormatter } from "src/domain/data";
import { thresholdEncodings } from "src/domain/map-encodings";
import { networkLevelUnits } from "src/domain/metrics";
import {
  getSunshineDetailsPageFromIndicator,
  sunshineDetailsLink,
} from "src/domain/query-states";
import {
  indicatorWikiPageSlugMapping,
  SunshineIndicator,
} from "src/domain/sunshine";
import { Maybe, SunshineDataIndicatorRow } from "src/graphql/queries";
import { UseEnrichedSunshineDataResult } from "src/hooks/use-enriched-sunshine-data";
import { useOperatorFeatureCollection } from "src/hooks/use-operator-feature-collection";
import {
  EntitySelection,
  useSelectedEntityData,
} from "src/hooks/use-selected-entity-data";
import { truthy } from "src/lib/truthy";
import { aggregateSunshineObservationsByOperator } from "src/utils/aggregate-observations";
import { shouldOpenInNewTab } from "src/utils/platform";

// Must be a function to be lazy evaluated in the correct i18n context
const getLegends: () => Record<
  | Exclude<SunshineIndicator, "networkCosts">
  | "networkCosts-CHF/km"
  | "networkCosts-CHF/kVA",
  string
> = () => ({
  "networkCosts-CHF/km": t({
    message: "Network costs in CHF/km",
    id: "sunshine.indicator.networkCosts-CHF/km",
  }),
  "networkCosts-CHF/kVA": t({
    message: "Network costs in CHF/kVA",
    id: "sunshine.indicator.networkCosts-CHF/kVA",
  }),
  netTariffs: t({
    message: "Net tariffs in Rp./kWh",
    id: "sunshine.indicator.netTariffs",
  }),
  energyTariffs: t({
    message: "Energy tariffs in Rp./kWh",
    id: "sunshine.indicator.energyTariffs",
  }),
  saidi: t({
    message: "Power outage duration (SAIDI) in minutes",
    id: "sunshine.indicator.saidi",
  }),
  saifi: t({
    message: "Power outage frequency (SAIFI) per year",
    id: "sunshine.indicator.saifi",
  }),
  outageInfo: t({
    message: "Informing the affected customer about planned interruptions",
    id: "sunshine.indicator.outageInfo",
  }),
  daysInAdvanceOutageNotification: t({
    message: "Days in advance for outage notification",
    id: "sunshine.indicator.daysInAdvanceOutageNotification",
  }),
  compliance: t({
    message: "Complies with the franc rule",
    id: "sunshine.indicator.compliance",
  }),
});

type SunshineMapProps = {
  enrichedDataResult: UseEnrichedSunshineDataResult;
  /**
   * Unfiltered data result (no peer group constraint) used for computing
   * the legend extent so that comparison group filtering acts as a pure mask
   * and does not change the legend min/max values.
   */
  unfilteredEnrichedDataResult?: UseEnrichedSunshineDataResult;
  colorScale: ScaleThreshold<number, string, never>;
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  valueFormatter: ValueFormatter;
  controls?: GenericMapControls;
  enabled?: boolean;
  period: string;
  indicator: SunshineIndicator;
  // Necessary when indicator is networkCosts
  networkLevel?: "NE5" | "NE6" | "NE7";
  // Necessary when indicator is netTariffs or energyTariffs
  category?: ElectricityCategory;
  widgets?: GenericMapProps["widgets"];
};

const SunshineMap = ({
  enrichedDataResult,
  unfilteredEnrichedDataResult,
  colorScale,
  accessor,
  valueFormatter,
  controls,
  period,
  indicator,
  networkLevel,
  category,
  widgets,
}: SunshineMapProps) => {
  const geoDataResult = useGeoData(period);

  // Get operator feature collection using the reusable hook
  const electricityCategory =
    indicator === "netTariffs" || indicator === "energyTariffs"
      ? category
      : undefined;

  const operatorFeatureResult = useOperatorFeatureCollection({
    period,
    electricityCategory,
    networkLevel,
    pause: !enrichedDataResult.data,
  });

  const legends = getLegends();

  const isLoading =
    enrichedDataResult.fetching ||
    geoDataResult.state === "fetching" ||
    operatorFeatureResult.fetching;

  const enrichedData = enrichedDataResult.data;
  // Use unfiltered data for the legend so the peer group mask doesn't affect
  // the legend extent. Falls back to the (possibly filtered) enrichedData when
  // no separate unfiltered result is provided.
  const legendSourceData = unfilteredEnrichedDataResult?.data ?? enrichedData;
  const geoData = geoDataResult.data;
  const enhancedGeoData = operatorFeatureResult.data;

  // Inner function should be extracted as a util and used by the energy-prices-map as well
  // Possbility this should be done directly in the function returning enrichedDataResult ?
  // Convert enriched data to format expected by map layers
  const observationsByOperator = useMemo(() => {
    return aggregateSunshineObservationsByOperator(
      enrichedData?.observationsByOperator,
      indicator,
    );
  }, [enrichedData?.observationsByOperator, indicator]);

  // Handle hover on operator layer
  const [hovered, setHovered] = useState<HoverState>();

  // Entity selection state - derived from hovered state
  const entitySelection: EntitySelection = useMemo(
    () => ({
      hoveredIds:
        hovered?.type === "operator" && hovered.id
          ? hovered.id.split(",")
          : null,
      selectedId: null,
      entityType: hovered?.type === "operator" ? "operator" : "municipality",
    }),
    [hovered],
  );

  // Use the unified entity selection hook
  const selectedEntityData = useSelectedEntityData({
    selection: entitySelection,
    enrichedData,
    dataType: "sunshine" as const,
    colorScale,
    formatValue: valueFormatter,
    priceComponent: "total",
    indicator,
  });

  const featuresWithObservations = useMemo(() => {
    const operatorIds = new Set(
      Object.keys(observationsByOperator).map((x) => parseInt(x, 10)),
    );
    return (
      enhancedGeoData?.features.filter(isOperatorFeature).filter((feature) => {
        return feature.properties.operators.some((operatorId) =>
          operatorIds.has(operatorId),
        );
      }) ?? []
    );
  }, [enhancedGeoData?.features, observationsByOperator]);

  const onHoverOperatorLayer = useCallback((info: PickingInfo) => {
    if (info.object?.properties) {
      const properties = info.object.properties as OperatorLayerProperties;
      const operatorIds = properties.operators;

      setHovered({
        type: "operator",
        id: operatorIds.join(","),
        x: info.x,
        y: info.y,
      });
    } else {
      setHovered(undefined);
    }
  }, []);

  // Create tooltip content using the unified entity data
  const tooltipContent = useMemo(() => {
    if (!selectedEntityData?.formattedData) {
      return { hoveredState: hovered, content: null };
    }

    return {
      hoveredState: hovered,
      content: <SelectedEntityCard {...selectedEntityData.formattedData} />,
    };
  }, [hovered, selectedEntityData?.formattedData]);

  const { onEntitySelect, activeId } = useMap();

  // Create map layers
  const makeLayers = useCallback(
    (renderMode: MapRenderMode) => {
      if (!enhancedGeoData?.features) {
        return [];
      }

      const handleOperatorLayerClick: GeoJsonLayerProps<OperatorFeature>["onClick"] =
        (info, ev) => {
          const id = (info.object?.properties as OperatorLayerProperties)
            ?.operators?.[0];
          if (!id) return;
          if (shouldOpenInNewTab(ev.srcEvent)) {
            const href = sunshineDetailsLink(
              `/sunshine/operator/${id}/${getSunshineDetailsPageFromIndicator(
                indicator,
              )}`,
              {
                tabDetails:
                  indicator === "daysInAdvanceOutageNotification"
                    ? "outageInfo"
                    : indicator,
              },
            );
            window.open(href, "_blank");
          } else {
            onEntitySelect(ev.srcEvent, "operator", id.toString());
          }
        };

      return [
        makeOperatorLayer({
          data: featuresWithObservations,
          accessor,
          observationsByOperator,
          colorScale,
          renderMode,
        }),
        geoData?.municipalities?.features
          ? makeMunicipalityLayer({
              data: geoData.municipalities.features,
              layerId: "municipality-layer",
              mode: "mesh",
              renderMode,
            })
          : null,
        geoData?.lakes
          ? makeLakesLayer({ data: geoData.lakes, renderMode })
          : null,
        geoData?.cantonMesh
          ? makeCantonsLayer({ data: geoData.cantonMesh, renderMode })
          : null,
        makeOperatorPickableLayer({
          data: featuresWithObservations,
          hovered,
          activeId: activeId ?? undefined,
          onHover: onHoverOperatorLayer,
          onClick: handleOperatorLayerClick,
          renderMode,
        }),
      ].filter(truthy);
    },
    [
      accessor,
      activeId,
      colorScale,
      enhancedGeoData,
      featuresWithObservations,
      geoData,
      hovered,
      indicator,
      observationsByOperator,
      onEntitySelect,
      onHoverOperatorLayer,
    ],
  );

  const mapLayers = useMemo(() => makeLayers("screen"), [makeLayers]);

  const index = useMemo(() => {
    return new Map(
      enhancedGeoData?.features
        .map((f) => {
          if (f.properties.operators.length !== 1) {
            // Ignore multi operator features for now
            return null;
          }
          return [f.properties.operators[0], f] as const;
        })
        .filter(truthy),
    );
  }, [enhancedGeoData?.features]);

  const getEntityFromHighlight = useCallback(
    (highlight: HighlightValue) => {
      const { entity: type, id } = highlight;
      if (!id || type !== "operator") {
        return;
      }
      const entity = index?.get(parseInt(id, 10));
      if (!entity) {
        return;
      }
      return entity;
    },
    [index],
  );

  const valuesExtent = useMemo(() => {
    if (
      !legendSourceData?.observations ||
      legendSourceData.observations.length === 0
    ) {
      return undefined;
    }
    return extent(
      legendSourceData.observations.map((x) => accessor(x)).filter(truthy),
    );
  }, [accessor, legendSourceData?.observations]);

  const legendId = useId();

  const legend = useMemo(() => {
    if (indicator === "outageInfo") {
      const thresholdEncoding = thresholdEncodings[indicator];
      const { thresholds, palette } = thresholdEncoding(undefined, [], +period);
      const ticks = [
        { value: 0, label: t({ id: "legend.no", message: "No" }) },
        { value: 1, label: t({ id: "legend.yes", message: "Yes" }) },
      ];
      // Get palette for consistency

      return (
        <MapColorLegend
          id={legendId}
          title={legends[indicator]}
          ticks={ticks}
          mode="yesNo"
          palette={palette}
          infoDialogButtonProps={getInfoDialogProps("help-outageInfo")}
          thresholds={thresholds}
        />
      );
    }

    if (!valuesExtent || !legendSourceData?.median || !colorScale) return null;
    const legendData = [
      valuesExtent[0],
      legendSourceData.median,
      valuesExtent[1],
    ];
    const legendKey =
      indicator === "networkCosts"
        ? (`${indicator}-${
            networkLevelUnits[networkLevel ?? ("NE5" as const)]
          }` as const)
        : indicator;

    // Get the threshold encoding function and generate thresholds and palette from a single source
    const thresholdEncoding = thresholdEncodings[indicator];
    const values: number[] = (legendSourceData.observations ?? [])
      .map((x) => x.value)
      .filter((v): v is number => v !== null && v !== undefined);
    const { thresholds, palette } = thresholdEncoding(
      legendSourceData.median,
      values,
      +period,
    );

    return (
      <MapColorLegend
        id={legendId}
        title={legends[legendKey]}
        ticks={legendData.map((value) => ({
          value,
          label: value !== undefined ? valueFormatter(value) : "",
        }))}
        palette={palette}
        thresholds={thresholds}
        infoDialogButtonProps={{
          slug: indicatorWikiPageSlugMapping[indicator],
          label: t({
            id: `help.${indicator}`,
            message: legends[legendKey],
          }),
        }}
      />
    );
  }, [
    indicator,
    valuesExtent,
    legendSourceData,
    colorScale,
    networkLevel,
    period,
    legendId,
    legends,
    valueFormatter,
  ]);

  return (
    <GenericMap
      layers={mapLayers}
      makeScreenshotLayers={makeLayers as (mode: MapRenderMode) => Layer[]}
      legend={legend}
      tooltipContent={tooltipContent}
      isLoading={isLoading}
      controls={controls}
      downloadId={`operator-map-${period}`}
      setHovered={setHovered}
      getEntityFromHighlight={getEntityFromHighlight}
      featureMatchesId={featureMatchesId}
      widgets={widgets}
    />
  );
};

const featureMatchesId = (
  feature: Feature<Geometry, GeoJsonProperties>,
  id: string,
) => {
  if (!isOperatorFeature(feature)) {
    return false;
  }
  const { operators } = feature.properties;
  return operators.length === 1 && operators[0] === parseInt(id, 10);
};

export default SunshineMap;
