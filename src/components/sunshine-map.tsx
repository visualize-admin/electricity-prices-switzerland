import { PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayerProps } from "@deck.gl/layers/typed";
import { t } from "@lingui/macro";
import { extent, mean, ScaleThreshold } from "d3";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { first } from "lodash";
import { useCallback, useId, useMemo, useState } from "react";

import { MapColorLegend } from "src/components/color-legend";
import { GenericMap, GenericMapControls } from "src/components/generic-map";
import { HighlightValue } from "src/components/highlight-context";
import { infoDialogProps } from "src/components/info-dialog-props";
import { useMap } from "src/components/map-context";
import { HoverState } from "src/components/map-helpers";
import {
  makeCantonsLayer,
  makeLakesLayer,
  makeMunicipalityLayer,
  makeSunshineOperatorLayer,
  makeSunshineOperatorPickableLayer,
} from "src/components/map-layers";
import { SelectedEntityCard } from "src/components/map-tooltip";
import {
  getOperatorsFeatureCollection,
  isOperatorFeature,
  MunicipalityFeatureCollection,
  OperatorFeature,
  OperatorLayerProperties,
  useGeoData,
} from "src/data/geo";
import { ValueFormatter } from "src/domain/data";
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
import {
  EntitySelection,
  useSelectedEntityData,
} from "src/hooks/use-selected-entity-data";
import { truthy } from "src/lib/truthy";
import { chartPalette } from "src/themes/palette";
import { shouldOpenInNewTab } from "src/utils/platform";

const legendTitleMapping: Record<
  | Exclude<SunshineIndicator, "networkCosts">
  | "networkCosts-CHF/km"
  | "networkCosts-CHF/kVA",
  string
> = {
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
};

type SunshineMapProps = {
  enrichedDataResult: UseEnrichedSunshineDataResult;
  colorScale: ScaleThreshold<number, string, never>;
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  valueFormatter: ValueFormatter;
  controls?: GenericMapControls;
  enabled?: boolean;
  period: string;
  indicator: SunshineIndicator;
  // Necessary when indicator is networkCosts
  networkLevel?: "NE5" | "NE6" | "NE7";
};

const aggregateFnPerIndicator: Record<
  SunshineIndicator,
  (
    obs: SunshineDataIndicatorRow["value"][]
  ) => SunshineDataIndicatorRow["value"]
> = {
  networkCosts: mean,
  netTariffs: mean,
  energyTariffs: mean,
  saidi: mean,
  saifi: mean,
  daysInAdvanceOutageNotification: first,
  outageInfo: first,
  compliance: first,
};

const SunshineMap = ({
  enrichedDataResult,
  colorScale,
  accessor,
  valueFormatter,
  controls,
  period,
  indicator,
  networkLevel,
}: SunshineMapProps) => {
  const geoDataResult = useGeoData(period);

  const isLoading =
    enrichedDataResult.fetching || geoDataResult.state === "fetching";

  const enrichedData = enrichedDataResult.data;
  const geoData = geoDataResult.data;

  // Convert enriched data to format expected by map layers
  const observationsByOperator = useMemo(() => {
    const aggregateFn = aggregateFnPerIndicator[indicator];
    const record: Record<string, SunshineDataIndicatorRow> = Object.fromEntries(
      (enrichedData?.observationsByOperator.entries() ?? []).map((x) => [
        x[0],

        {
          ...x[1][0],
          value: aggregateFn(x[1].map((obs) => obs.value)),
        },
      ])
    );
    return record;
  }, [enrichedData?.observationsByOperator, indicator]);

  const enhancedGeoData = useMemo(() => {
    if (!enrichedData?.operatorMunicipalities || !geoData) {
      return null;
    }
    const operatorsFeatureCollection = getOperatorsFeatureCollection(
      enrichedData.operatorMunicipalities,
      geoData?.municipalities as MunicipalityFeatureCollection
    );

    const features = operatorsFeatureCollection.features;

    return {
      ...operatorsFeatureCollection,
      features,
    };
  }, [enrichedData?.operatorMunicipalities, geoData]);

  // Entity selection state
  const [entitySelection, setEntitySelection] = useState<EntitySelection>({
    hoveredId: null,
    selectedId: null,
    entityType: "municipality",
  });

  // Use the unified entity selection hook
  const selectedEntityData = useSelectedEntityData({
    selection: entitySelection,
    enrichedData,
    dataType: "sunshine" as const,
    colorScale,
    formatValue: valueFormatter,
    priceComponent: "total",
  });

  // Handle hover on operator layer
  const [hovered, setHovered] = useState<HoverState>();
  const onHoverOperatorLayer = useCallback(
    (info: PickingInfo) => {
      if (info.object?.properties) {
        const properties = info.object.properties as OperatorLayerProperties;
        const operatorIds = properties.operators;

        const values = operatorIds.map((operatorId) => {
          const observation = observationsByOperator[operatorId];
          return observation ? accessor(observation) : undefined;
        });

        if (values.every((v) => v === null || v === undefined)) {
          setHovered(undefined);
          setEntitySelection((prev) => ({ ...prev, hoveredId: null }));
          return;
        }

        // Set entity selection for the unified hook
        const hoveredId = operatorIds[0]?.toString();
        setEntitySelection((prev) => ({ ...prev, hoveredId }));

        setHovered({
          type: "operator",
          id: operatorIds.join(","),
          values: operatorIds
            .map((operatorId) => {
              const observation = observationsByOperator[operatorId];
              const value = observation ? accessor(observation) : undefined;

              if (value === undefined || value === null) {
                return undefined;
              }
              return {
                value,
                operatorName: observation?.name ?? "",
              };
            })
            .filter(truthy),
          x: info.x,
          y: info.y,
        });
      } else {
        setHovered(undefined);
        setEntitySelection((prev) => ({ ...prev, hoveredId: null }));
      }
    },
    [accessor, observationsByOperator]
  );

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

  // Handle click on map layers (primarily for zooming)
  const handleLayerClick = useCallback((info: PickingInfo) => {
    if (info.object?.geometry) {
      // No need to handle zoom directly, GenericMap will handle this
      // when we return the object from the click handler
    }
  }, []);

  const { onEntitySelect, activeId } = useMap();

  // Create map layers
  const mapLayers = useMemo(() => {
    const handleOperatorLayerClick: GeoJsonLayerProps<OperatorFeature>["onClick"] =
      (info, ev) => {
        // TODO Only the first operator is used
        const id = (info.object?.properties as OperatorLayerProperties)
          ?.operators?.[0];
        if (!id) {
          return;
        }

        if (shouldOpenInNewTab(ev.srcEvent)) {
          const href = sunshineDetailsLink(
            `/sunshine/operator/${id}/${getSunshineDetailsPageFromIndicator(
              indicator
            )}`,
            { tab: indicator }
          );
          window.open(href, "_blank");
        } else {
          const selectedId = id.toString();
          setEntitySelection((prev) => ({ ...prev, selectedId }));
          onEntitySelect(ev.srcEvent, "operator", selectedId);
        }
      };

    if (!enhancedGeoData || !enhancedGeoData.features) {
      return [];
    }

    return [
      makeSunshineOperatorLayer({
        data: enhancedGeoData.features,
        accessor,
        observationsByOperator,
        colorScale,
      }),
      geoData?.municipalities?.features
        ? makeMunicipalityLayer({
            data: geoData.municipalities.features,
            layerId: "municipality-layer",
            mode: "mesh",
          })
        : null,
      geoData?.lakes
        ? makeLakesLayer({
            data: geoData.lakes,
          })
        : null,
      geoData?.cantonMesh
        ? makeCantonsLayer({
            data: geoData.cantonMesh,
          })
        : null,
      makeSunshineOperatorPickableLayer({
        data: enhancedGeoData.features,
        accessor,
        observationsByOperator,
        hovered,
        activeId: activeId ?? undefined,
        onHover: onHoverOperatorLayer,
        onClick: handleOperatorLayerClick,
      }),
    ].filter(truthy);
  }, [
    accessor,
    activeId,
    colorScale,
    enhancedGeoData,
    geoData?.cantonMesh,
    geoData?.lakes,
    geoData?.municipalities.features,
    hovered,
    indicator,
    observationsByOperator,
    onEntitySelect,
    onHoverOperatorLayer,
  ]);

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
        .filter(truthy)
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
    [index]
  );

  const valuesExtent = useMemo(() => {
    if (!enrichedData?.observations || enrichedData.observations.length === 0) {
      return undefined;
    }
    return extent(
      enrichedData.observations.map((x) => accessor(x)).filter(truthy)
    );
  }, [accessor, enrichedData?.observations]);

  const legendId = useId();

  const renderLegend = useCallback(() => {
    if (indicator === "compliance" || indicator === "outageInfo") {
      const complianceTicks = [
        { value: 0, label: t({ id: "legend.no", message: "No" }) },
        { value: 1, label: t({ id: "legend.yes", message: "Yes" }) },
      ];
      return (
        <MapColorLegend
          id={legendId}
          title={legendTitleMapping[indicator]}
          ticks={complianceTicks}
          mode="yesNo"
          palette={chartPalette.diverging.GreenToOrange}
          infoDialogButtonProps={infoDialogProps["help-compliance"]}
        />
      );
    }

    if (!valuesExtent || !enrichedData?.median || !colorScale) return null;
    const legendData = [valuesExtent[0], enrichedData.median, valuesExtent[1]];
    const legendKey =
      indicator === "networkCosts"
        ? (`${indicator}-${
            networkLevelUnits[networkLevel ?? ("NE5" as const)]
          }` as const)
        : indicator;
    return (
      <MapColorLegend
        id={legendId}
        title={legendTitleMapping[legendKey]}
        ticks={legendData.map((value) => ({
          value,
          label: value !== undefined ? valueFormatter(value) : "",
        }))}
        palette={
          indicator === "daysInAdvanceOutageNotification"
            ? chartPalette.diverging.GreenToOrange.slice().reverse()
            : chartPalette.diverging.GreenToOrange
        }
        infoDialogButtonProps={{
          slug: indicatorWikiPageSlugMapping[indicator],
          label: t({
            id: `help.${indicator}`,
            message: legendTitleMapping[legendKey],
          }),
        }}
      />
    );
  }, [
    indicator,
    valuesExtent,
    enrichedData?.median,
    colorScale,
    legendId,
    networkLevel,
    valueFormatter,
  ]);

  return (
    <GenericMap
      layers={mapLayers}
      legend={renderLegend()}
      tooltipContent={tooltipContent}
      isLoading={isLoading}
      onLayerClick={handleLayerClick}
      controls={controls}
      downloadId={`operator-map-${period}`}
      setHovered={setHovered}
      getEntityFromHighlight={getEntityFromHighlight}
      featureMatchesId={featureMatchesId}
    />
  );
};

const featureMatchesId = (
  feature: Feature<Geometry, GeoJsonProperties>,
  id: string
) => {
  if (!isOperatorFeature(feature)) {
    return false;
  }
  const { operators } = feature.properties;
  return operators.length === 1 && operators[0] === parseInt(id, 10);
};

export default SunshineMap;
