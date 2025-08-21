import { PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayerProps } from "@deck.gl/layers/typed";
import { t, Trans } from "@lingui/macro";
import { extent, ScaleThreshold } from "d3";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { keyBy } from "lodash";
import { useCallback, useId, useMemo, useState } from "react";

import { MapColorLegend } from "src/components/color-legend";
import { GenericMap, GenericMapControls } from "src/components/generic-map";
import { HighlightValue } from "src/components/highlight-context";
import { useMap } from "src/components/map-context";
import { HoverState } from "src/components/map-helpers";
import {
  makeCantonsLayer,
  makeLakesLayer,
  makeMunicipalityLayer,
  makeSunshineOperatorLayer,
  makeSunshineOperatorPickableLayer,
} from "src/components/map-layers";
import { MapTooltipContent } from "src/components/map-tooltip";
import {
  getOperatorsFeatureCollection,
  isOperatorFeature,
  MunicipalityFeatureCollection,
  OperatorFeature,
  OperatorLayerProperties,
  useGeoData,
} from "src/data/geo";
import { useFetch } from "src/data/use-fetch";
import { ValueFormatter } from "src/domain/data";
import {
  indicatorWikiPageSlugMapping,
  SunshineIndicator,
} from "src/domain/sunshine";
import { Maybe, SunshineDataIndicatorRow } from "src/graphql/queries";
import { truthy } from "src/lib/truthy";
import { getOperatorsMunicipalities } from "src/rdf/queries";

const indicatorLegendTitleMapping: Record<SunshineIndicator, string> = {
  networkCosts: t({
    message: "Network costs in CHF/MWh",
    id: "sunshine.indicator.networkCosts",
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
  serviceQuality: t({
    message: "Informing the affected customer about planned interruptions",
    id: "sunshine.indicator.serviceQuality",
  }),
  compliance: t({
    message: "Complies with the franc rule",
    id: "sunshine.indicator.compliance",
  }),
};

type SunshineMapProps = {
  period: string;
  indicator: SunshineIndicator;
  colorScale: ScaleThreshold<number, string, never>;
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  observations?: SunshineDataIndicatorRow[];
  valueFormatter: ValueFormatter;
  controls?: GenericMapControls;
  medianValue: number | undefined;
  observationsQueryFetching: boolean;
};

const SunshineMap = ({
  period,
  indicator,
  colorScale,
  accessor,
  observations,
  observationsQueryFetching,
  controls,
  valueFormatter,
  medianValue,
}: SunshineMapProps) => {
  // TODO Right now we fetch operators municipalities through EC2 indicators
  // This is not ideal, but we don't have a better way to get the operator municipalities
  // We should probably add a query to get the operator municipalities directly
  const electricityCategory = "C2" as const;

  const operatorMunicipalitiesResult = useFetch({
    key: `operator-municipalities-${period}-${electricityCategory}`,
    queryFn: () => getOperatorsMunicipalities(period, electricityCategory),
  });
  const geoDataResult = useGeoData(period);

  const isLoading =
    operatorMunicipalitiesResult.state === "fetching" ||
    geoDataResult.state === "fetching" ||
    observationsQueryFetching;

  const operatorMunicipalities = operatorMunicipalitiesResult.data;
  const geoData = geoDataResult.data;

  const observationsByOperator = useMemo(() => {
    return keyBy(observations ?? [], "operatorId");
  }, [observations]);

  const enhancedGeoData = useMemo(() => {
    if (!operatorMunicipalities || !geoData) {
      return null;
    }
    return getOperatorsFeatureCollection(
      operatorMunicipalities,
      geoData?.municipalities as MunicipalityFeatureCollection
    );
  }, [operatorMunicipalities, geoData]);

  // We'll use GenericMap's internal viewState management instead

  const [hovered, setHovered] = useState<HoverState>();
  const onHoverOperatorLayer = useCallback(
    (info: PickingInfo) => {
      if (info.object && info.object.properties) {
        const properties = info.object.properties as OperatorLayerProperties;
        const operatorIds = properties.operators;
        const values = operatorIds.map((x) =>
          accessor(observationsByOperator[x])
        );
        if (!values || values.length === 0) {
          setHovered(undefined);
          return;
        }
        setHovered({
          type: "operator",
          id: operatorIds.join(","),
          values: operatorIds
            .map((x) => {
              const value = accessor(observationsByOperator[x]);
              if (value === undefined || value === null) {
                return undefined;
              }
              return {
                value,
                operatorName: observationsByOperator[x]?.name ?? "",
              };
            })
            .filter(truthy),
          x: info.x,
          y: info.y,
        });
      } else {
        setHovered(undefined);
      }
    },
    [accessor, observationsByOperator]
  );

  // Create tooltip content conditionally, only when there's a hover state
  const tooltipContent = useMemo(() => {
    if (!hovered || hovered.type !== "operator" || !colorScale) {
      return { hoveredState: hovered, content: null };
    }

    return {
      hoveredState: hovered,
      content: (
        <MapTooltipContent
          title={""}
          caption={<Trans id="operator">Operator</Trans>}
          values={
            hovered.values.map((x) => ({
              label: x.operatorName,
              formattedValue: valueFormatter(x.value),
              color: colorScale(x.value),
            })) ?? []
          }
        />
      ),
    };
  }, [hovered, colorScale, valueFormatter]);

  // Handle click on map layers (primarily for zooming)
  const handleLayerClick = useCallback((info: PickingInfo) => {
    if (info.object && info.object.geometry) {
      // No need to handle zoom directly, GenericMap will handle this
      // when we return the object from the click handler
    }
  }, []);

  const { onEntitySelect, activeId } = useMap();

  // Create map layers
  const mapLayers = useMemo(() => {
    const handleOperatorLayerClick: GeoJsonLayerProps<OperatorFeature>["onClick"] =
      (ev) => {
        // TODO Only the first operator is used
        const id = (ev.object?.properties as OperatorLayerProperties)
          ?.operators?.[0];
        if (!id) {
          return;
        }
        onEntitySelect(ev, "operator", id.toString());
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
    if (!observations || observations.length === 0) {
      return undefined;
    }
    return extent(observations.map((x) => accessor(x)).filter(truthy));
  }, [accessor, observations]);
  const legendId = useId();

  const renderLegend = useCallback(() => {
    if (indicator === "compliance" || indicator === "serviceQuality") {
      const complianceTicks = [
        { value: 0, label: t({ id: "legend.no", message: "No" }) },
        { value: 1, label: t({ id: "legend.yes", message: "Yes" }) },
      ];
      return (
        <MapColorLegend
          id={legendId}
          title={indicatorLegendTitleMapping[indicator]}
          ticks={complianceTicks}
          mode="yesNo"
        />
      );
    }

    if (!valuesExtent || !medianValue || !colorScale) return null;
    const legendData = [valuesExtent[0], medianValue, valuesExtent[1]];
    return (
      <MapColorLegend
        id={legendId}
        title={indicatorLegendTitleMapping[indicator]}
        ticks={legendData.map((value) => ({
          value,
          label: value !== undefined ? valueFormatter(value) : "",
        }))}
        infoDialogButtonProps={{
          slug: indicatorWikiPageSlugMapping[indicator],
          label: t({
            id: `help.${indicator}`,
            message: indicatorLegendTitleMapping[indicator],
          }),
        }}
      />
    );
  }, [
    valuesExtent,
    medianValue,
    colorScale,
    legendId,
    valueFormatter,
    indicator,
  ]);

  if (!geoData || !geoData.municipalities || !enhancedGeoData) {
    return null;
  }

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
  return operators.length === 1 && operators[0] == parseInt(id, 10);
};

export default SunshineMap;
