import { LayerProps, PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { Trans } from "@lingui/macro";
// We don't need turf anymore as GenericMap handles zooming
import { easeExpIn, mean, ScaleThreshold } from "d3";
import { Feature, Geometry, MultiPolygon, Polygon } from "geojson";
import { keyBy } from "lodash";
import { useCallback, useMemo, useRef, useState } from "react";

import { GenericMap } from "src/components/generic-map";
import { getFillColor, styles } from "src/components/map-helpers";
import { MapTooltipContent } from "src/components/map-tooltip";
import {
  getOperatorsFeatureCollection,
  MunicipalityFeatureCollection,
  OperatorLayerProperties,
  useGeoData,
} from "src/data/geo";
import { useFetch } from "src/data/use-fetch";
import { ElectricityCategory } from "src/domain/data";
import { useFormatCurrency } from "src/domain/helpers";
import { Maybe, SunshineDataRow } from "src/graphql/queries";
import { truthy } from "src/lib/truthy";
import { getOperatorsMunicipalities } from "src/rdf/queries";

import { HoverState } from "./map-helpers";

// Using styles.operators.pickable.fillColor instead of defining a constant

const sunshineAttributeToElectricityCategory: Partial<
  Record<keyof SunshineDataRow, ElectricityCategory>
> = {
  tariffEC2: "C2",
  tariffEC3: "C3",
  tariffEC4: "C4",
  tariffEC6: "C6",
  tariffEH2: "H2",
  tariffEH4: "H4",
  tariffEH7: "H7",
  tariffNC2: "C2",
  tariffNC3: "C3",
  tariffNC4: "C4",
  tariffNC6: "C6",
  tariffNH2: "H2",
  tariffNH4: "H4",
  tariffNH7: "H7",
};

export const displayedAttributes = [
  "tariffEC2",
  "tariffEC3",
  "tariffEC4",
  "tariffEC6",
  "tariffEH2",
  "tariffEH4",
  "tariffEH7",
  "tariffNC2",
  "tariffNC3",
  "tariffNC4",
  "tariffNC6",
  "tariffNH2",
  "tariffNH4",
  "tariffNH7",
  "saidiTotal",
  "saidiUnplanned",
  "saifiTotal",
  "saifiUnplanned",
] satisfies (keyof SunshineDataRow)[];

export type DisplayedAttribute = (typeof displayedAttributes)[number];

type PickingInfoGeneric<Props> = Omit<PickingInfo, "object"> & {
  object?: Feature<Geometry, Props> | null;
};

export type GetOperatorsMapTooltip = (
  info: PickingInfoGeneric<OperatorLayerProperties>
) => null | {
  html: string;
};

type OperatorsMapProps = {
  period: string;
  colorScale: ScaleThreshold<number, string, never>;
  accessor: (x: SunshineDataRow) => Maybe<number> | undefined;
  observations?: SunshineDataRow[];
  getTooltip?: GetOperatorsMapTooltip;
  onHoverOperatorLayer?: LayerProps["onHover"];
};

const OperatorsMap = ({
  period,
  colorScale,
  accessor,
  observations,
}: OperatorsMapProps) => {
  const mapControlsRef = useRef<{
    getImageData: () => Promise<string | undefined>;
    zoomOn: (id: string) => void;
    zoomOut: () => void;
  } | null>(null);

  // TODO Right now we fetch operators municipalities through EC2 indicators
  // This is not ideal, but we don't have a better way to get the operator municipalities
  // We should probably add a query to get the operator municipalities directly
  const electricityCategory =
    sunshineAttributeToElectricityCategory["tariffEC2" as const]!;

  const { data: operatorMunicipalities } = useFetch({
    key: `operator-municipalities-${period}-${electricityCategory}`,
    queryFn: () => getOperatorsMunicipalities(period, electricityCategory),
  });
  const { data: geoData } = useGeoData(period);

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

  const getMapFillColor = useCallback(
    (x: Feature<Geometry, OperatorLayerProperties>) => {
      if (!x.properties) {
        return styles.operators.pickable.fillColor;
      }
      const operatorIds = x.properties.operators;
      const values = operatorIds
        .map((x) => {
          const op = observationsByOperator[x];

          return accessor(op) ?? null;
        })
        .filter(truthy);
      if (values.length === 0) {
        return styles.operators.pickable.fillColor;
      }
      const value = mean(values);
      const color = getFillColor(colorScale, value, false);
      return color;
    },
    [accessor, colorScale, observationsByOperator]
  );

  // We'll use GenericMap's internal viewState management instead

  const [hovered, setHovered] = useState<HoverState>();
  const onHoverOperatorLayer: LayerProps["onHover"] = useCallback(
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
  const formatNumber = useFormatCurrency();

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
              formattedValue: formatNumber(x.value),
              color: colorScale(x.value),
            })) ?? []
          }
        />
      ),
    };
  }, [hovered, colorScale, formatNumber]);

  // Handle click on map layers (primarily for zooming)
  const handleLayerClick = useCallback((info: PickingInfo) => {
    if (info.object && info.object.geometry) {
      // No need to handle zoom directly, GenericMap will handle this
      // when we return the object from the click handler
    }
  }, []);

  if (!geoData || !geoData.municipalities || !enhancedGeoData) {
    return null;
  }

  // Create map layers
  const mapLayers = [
    new GeoJsonLayer<Feature<Polygon | MultiPolygon, OperatorLayerProperties>>({
      id: "operator-layer",
      data: enhancedGeoData.features,
      filled: true,
      pickable: true,
      highlightColor: styles.operators.base.highlightColor,
      updateTriggers: {
        getFillColor: [getMapFillColor],
      },
      getFillColor: getMapFillColor,
      getLineColor: styles.operators.base.lineColor,
      getLineWidth: styles.operators.base.lineWidth,
      lineWidthUnits: "pixels",
      transitions: {
        getFillColor: {
          duration: styles.operators.base.transitions.duration,
          easing: easeExpIn,
        },
      },
    }),

    // Transparent layer only used for hover effect
    new GeoJsonLayer<Feature<Polygon | MultiPolygon, OperatorLayerProperties>>({
      id: "operator-layer-pickable",
      data: enhancedGeoData.features,
      filled: true,
      onHover: onHoverOperatorLayer,
      autoHighlight: true,
      stroked: false,
      highlightColor: styles.operators.pickable.highlightColor,
      updateTriggers: {
        getFillColor: [getMapFillColor],
      },
      getFillColor: styles.operators.pickable.fillColor,
      lineWidthUnits: "pixels",
      pickable: true,
    }),

    // Municipality Layer
    new GeoJsonLayer({
      id: "municipality-layer",
      data: geoData.municipalities.features,
      getLineColor: styles.operators.municipalityOutline.lineColor,
      highlightColor: styles.operators.municipalityOutline.highlightColor,
      lineWidthUnits: "pixels",
      stroked: true,
      autoHighlight: true,
      getLineWidth: styles.operators.municipalityOutline.lineWidth,
      filled: false,
    }),
  ];

  return (
    <GenericMap
      layers={mapLayers}
      tooltipContent={tooltipContent}
      onLayerClick={handleLayerClick}
      controls={mapControlsRef}
      downloadId={`operator-map-${period}`}
    />
  );
};

export default OperatorsMap;
