import { LayerProps, PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import * as turf from "@turf/turf";
import { easeExpIn, mean, ScaleThreshold } from "d3";
import { Feature, Geometry, MultiPolygon, Polygon } from "geojson";
import { keyBy } from "lodash";
import { useCallback, useMemo, useRef } from "react";

import { getFillColor, getZoomFromBounds } from "src/components/map-helpers";
import {
  getOperatorsFeatureCollection,
  MunicipalityFeatureCollection,
  OperatorLayerProperties,
  useGeoData,
} from "src/data/geo";
import { useFetch } from "src/data/use-fetch";
import { ElectricityCategory } from "src/domain/data";
import { Maybe, SunshineDataRow } from "src/graphql/queries";
import { truthy } from "src/lib/truthy";
import { getOperatorsMunicipalities } from "src/rdf/queries";

const TRANSPARENT = [255, 255, 255, 0] as [number, number, number, number];

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
  getTooltip,
  onHoverOperatorLayer,
}: OperatorsMapProps) => {
  const deckglRef = useRef<DeckGLRef>(null);

  // TODO
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
        return TRANSPARENT;
      }
      const operatorIds = x.properties.operators;
      const values = operatorIds
        .map((x) => {
          const op = observationsByOperator[x];

          return accessor(op) ?? null;
        })
        .filter(truthy);
      if (values.length === 0) {
        return TRANSPARENT;
      }
      const value = mean(values);
      const color = getFillColor(colorScale, value, false);
      return color;
    },
    [accessor, colorScale, observationsByOperator]
  );

  if (!geoData || !geoData.municipalities || !enhancedGeoData) {
    return null;
  }

  return (
    <DeckGL
      initialViewState={{
        latitude: 46.8182,
        longitude: 8.2275,
        zoom: 7,
        maxZoom: 16,
        minZoom: 2,
        pitch: 0,
        bearing: 0,
      }}
      getTooltip={getTooltip}
      controller={true}
      ref={deckglRef}
      layers={[
        new GeoJsonLayer<
          Feature<Polygon | MultiPolygon, OperatorLayerProperties>
        >({
          id: "operator-layer",
          data: enhancedGeoData.features,
          filled: true,
          autoHighlight: true,
          highlightColor: [0, 0, 0, 100],
          updateTriggers: {
            getFillColor: [getMapFillColor],
          },
          getFillColor: (x) => getMapFillColor(x),
          getLineColor: [255, 255, 255, 100],
          getLineWidth: 1.5,
          lineWidthUnits: "pixels",
          onHover: onHoverOperatorLayer,
          onClick: (info) => {
            if (info.object && info.viewport) {
              const bounds = turf.bbox(info.object.geometry);
              deckglRef.current?.deck?.setProps({
                viewState: {
                  longitude: (bounds[0] + bounds[2]) / 2,
                  latitude: (bounds[1] + bounds[3]) / 2,
                  zoom: getZoomFromBounds(bounds, info.viewport),
                  transitionDuration: 300,
                },
              });
            }
          },
          transitions: {
            getFillColor: {
              duration: 300,
              easing: easeExpIn,
            },
          },
        }),

        // Transparent layer only used for hover effect
        new GeoJsonLayer<
          Feature<Polygon | MultiPolygon, OperatorLayerProperties>
        >({
          id: "operator-layer-pickable",
          data: enhancedGeoData.features,
          filled: true,
          autoHighlight: true,
          stroked: false,
          highlightColor: [0, 0, 0, 100],
          updateTriggers: {
            getFillColor: [getMapFillColor],
          },
          getFillColor: TRANSPARENT,
          lineWidthUnits: "pixels",
          pickable: true,
        }),

        // Municipality Layer
        new GeoJsonLayer({
          id: "municipality-layer",
          data: geoData.municipalities.features,
          getLineColor: [255, 255, 255],
          highlightColor: [0, 0, 255],
          lineWidthUnits: "pixels",
          stroked: true,
          autoHighlight: true,
          getLineWidth: 0.25,
          filled: false,
        }),
      ]}
    />
  );
};

export default OperatorsMap;
