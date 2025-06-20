import { Layer, LayerProps, PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { t, Trans } from "@lingui/macro";
import { extent, group, mean, rollup, ScaleThreshold } from "d3";
import React, {
  ComponentProps,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { MapColorLegend } from "src/components/color-legend";
import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { getFillColor, styles } from "src/components/map-helpers";
import { MapTooltipContent } from "src/components/map-tooltip";
import { useGeoData } from "src/data/geo";
import { useFormatCurrency } from "src/domain/helpers";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";
import { maxBy } from "src/lib/array";

import { GenericMap } from "./generic-map";
import { useMap } from "./map-context";
import { HoverState } from "./map-helpers";

const DOWNLOAD_ID = "map";

const __debugCheckObservationsWithoutShapes = (
  observationsByMunicipalityId: Map<
    string,
    OperatorObservationFieldsFragment[]
  >,
  feature: GeoJSON.FeatureCollection
) => {
  const observationIds = new Set(observationsByMunicipalityId.keys());
  const featureIds = new Set(
    feature.features.flatMap((f) => (f.id ? [f.id.toString()] : []))
  );

  if (observationIds.size !== featureIds.size) {
    const obsWithoutFeatures = [...observationIds].filter(
      (id) => !featureIds.has(id)
    );

    if (obsWithoutFeatures.length > 0) {
      console.info("Obervations without features", obsWithoutFeatures);
    }

    const featuresWithoutObs = [...featureIds].filter(
      (id) => !observationIds.has(id)
    );

    if (featuresWithoutObs.length > 0) {
      console.info("Features without observations", featuresWithoutObs);
    }
  }
};

export const EnergyPricesMap = ({
  year,
  observations,
  observationsQueryFetching,
  medianValue,
  municipalities,
  colorScale,
  controls,
}: {
  year: string;
  observations: OperatorObservationFieldsFragment[];
  observationsQueryFetching: boolean;
  medianValue: number | undefined;
  municipalities: { id: string; name: string }[];
  colorScale: ScaleThreshold<number, string> | undefined;
  controls?: React.MutableRefObject<{
    getImageData: () => Promise<string | undefined>;
    zoomOn: (id: string) => void;
    zoomOut: () => void;
  } | null>;
}) => {
  const [hovered, setHovered] = useState<HoverState>();
  const { activeId, onEntitySelect } = useMap();
  const legendId = useId();

  const geoData = useGeoData(year);

  const observationsByMunicipalityId = useMemo(() => {
    return group(observations, (d) => d.municipality);
  }, [observations]);

  const municipalityNames = useMemo(() => {
    return rollup(
      municipalities,
      (values) => {
        // FIXME: There is no clear way to distinguish which of the labels should be picked. This case seems only to happen on AbolishedMunicipality classes
        // So for now we just pick the first one.

        // if (values.length > 1) {
        //   console.log("Duplicate munis", values);
        // }
        return values[0];
      },
      (d) => d.id
    );
  }, [municipalities]);

  useEffect(() => {
    if (geoData.state === "loaded" && observationsByMunicipalityId.size > 0) {
      __debugCheckObservationsWithoutShapes(
        observationsByMunicipalityId,
        geoData.data.municipalities
      );
    }
  }, [geoData, observationsByMunicipalityId]);

  const formatNumber = useFormatCurrency();

  const { value: highlightContext } = useContext(HighlightContext);

  const indexes = useMemo(() => {
    if (geoData.state !== "loaded") {
      return;
    }
    const municipalities = geoData.data.municipalities;
    const cantons = geoData.data.cantons;
    return {
      municipalities: new Map(
        municipalities?.features.map((x) => [x.id, x]) ?? []
      ),
      cantons: new Map(cantons?.features.map((x) => [x.id, x]) ?? []),
    };
  }, [geoData]);

  const tooltipContent = useMemo(() => {
    if (!hovered || !colorScale)
      return { hoveredState: undefined, content: null };

    if (hovered.type === "municipality") {
      const hoveredObservations = observationsByMunicipalityId.get(hovered.id);
      const hoveredMunicipalityName = municipalityNames.get(hovered.id)?.name;
      const hoveredCanton = maxBy(
        hoveredObservations,
        (x) => x.period
      )?.cantonLabel;

      const content = (
        <MapTooltipContent
          title={`${hoveredMunicipalityName ?? "-"} ${
            hoveredCanton ? `- ${hoveredCanton}` : ""
          }`}
          caption={<Trans id="municipality">Municipality</Trans>}
          values={
            hoveredObservations?.length
              ? hoveredObservations.map((d) => ({
                  label: d.operatorLabel,
                  formattedValue: formatNumber(d.value),
                  color: colorScale(d.value),
                }))
              : []
          }
        />
      );

      return { hoveredState: hovered, content };
    } else if (hovered.type === "canton") {
      const content = (
        <MapTooltipContent
          title={hovered.label}
          caption={<Trans id="canton">Canton</Trans>}
          values={[
            {
              label: "",
              formattedValue: formatNumber(hovered.value),
              color: colorScale(hovered.value),
            },
          ]}
        />
      );

      return { hoveredState: hovered, content };
    }

    return { hoveredState: undefined, content: null };
  }, [
    hovered,
    colorScale,
    observationsByMunicipalityId,
    municipalityNames,
    formatNumber,
  ]);

  const getEntityFromHighlight = useCallback(
    (highlight: HighlightValue) => {
      const { entity: type, id } = highlight;
      if (!indexes || !id) {
        return;
      }
      const index =
        type === "canton"
          ? indexes.cantons
          : type === "municipality"
          ? indexes.municipalities
          : undefined;
      const entity = index?.get(parseInt(id, 10));
      if (!entity) {
        return;
      }
      return entity;
    },
    [indexes]
  );

  const valuesExtent = useMemo(() => {
    const meansByMunicipality = rollup(
      observations,
      (values) => mean(values, (d) => d.value),
      (d) => d.municipality
    ).values();
    return extent(meansByMunicipality, (d) => d) as [number, number];
  }, [observations]);

  const layers = useMemo(() => {
    if (geoData.state !== "loaded") {
      return [];
    }

    const handleMunicipalityLayerClick: LayerProps["onClick"] = (info, ev) => {
      if (!indexes || !info.layer) {
        return;
      }
      const id = info.object.id as number;
      const type =
        info.layer.id === "municipalities" ? "municipality" : "canton";
      if (
        type === "municipality" &&
        !observationsByMunicipalityId.get(`${id}`)
      ) {
        return;
      }

      onEntitySelect(ev, "municipality", id.toString());
    };

    return [
      new GeoJsonLayer({
        id: "municipalities-base",
        /** @ts-expect-error bad types */
        data: geoData.data.municipalities,
        pickable: true,
        stroked: false,
        filled: true,
        extruded: false,
        autoHighlight: false,
        getFillColor: (d) => {
          const id = d?.id?.toString();
          if (!id) return styles.municipalities.base.fillColor.doesNotExist;

          const obs = observationsByMunicipalityId.get(id);
          return obs
            ? getFillColor(
                colorScale,
                mean(obs, (d) => d.value),
                highlightContext?.id === id
              )
            : styles.municipalities.base.fillColor.withoutData;
        },
        onHover: ({ x, y, object }: PickingInfo) => {
          const id = object?.id?.toString();
          setHovered(
            object && id
              ? {
                  x,
                  y,
                  id,
                  type: "municipality",
                }
              : undefined
          );
        },
        onClick: handleMunicipalityLayerClick,
        updateTriggers: {
          getFillColor: [observationsByMunicipalityId, highlightContext?.id],
        },
      }),
      new GeoJsonLayer({
        id: "municipality-mesh",
        /** @ts-expect-error bad types */
        data: geoData.data.municipalityMesh,
        pickable: false,
        stroked: true,
        filled: false,
        extruded: false,
        lineWidthMinPixels: styles.municipalityMesh.lineWidthMinPixels,
        lineWidthMaxPixels: styles.municipalityMesh.lineWidthMaxPixels,
        getLineWidth: styles.municipalityMesh.lineWidth,
        lineMiterLimit: 1,
        getLineColor: styles.municipalityMesh.lineColor,
      }),
      new GeoJsonLayer({
        id: "lakes",
        /** @ts-expect-error bad types */
        data: geoData.data.lakes,
        pickable: false,
        stroked: true,
        filled: true,
        extruded: false,
        lineWidthMinPixels: styles.lakes.lineWidthMinPixels,
        lineWidthMaxPixels: styles.lakes.lineWidthMaxPixels,
        getLineWidth: styles.lakes.lineWidth,
        getFillColor: styles.lakes.fillColor,
        getLineColor: styles.lakes.lineColor,
      }),
      new GeoJsonLayer({
        id: "cantons",
        /** @ts-expect-error bad types */
        data: geoData.data.cantonMesh,
        pickable: false,
        stroked: true,
        filled: false,
        extruded: false,
        lineWidthMinPixels: styles.cantons.lineWidthMinPixels,
        lineWidthMaxPixels: styles.cantons.lineWidthMaxPixels,
        getLineWidth: styles.cantons.lineWidth,
        lineMiterLimit: 1,
        getLineColor: styles.cantons.lineColor,
        parameters: {
          depthTest: false,
        },
      }),
      new GeoJsonLayer({
        id: "municipalities-overlay",
        /** @ts-expect-error bad types */
        data: geoData.data.municipalities,
        pickable: false,
        stroked: true,
        filled: true,
        extruded: false,
        getFillColor: (d) => {
          const id = d?.id?.toString();
          if (!id) return styles.municipalities.overlay.default.fillColor;

          const isActive = activeId === id;
          const isHovered =
            hovered?.type === "municipality" && hovered.id === id;
          const hasInteraction = hovered || activeId;

          if (isActive || isHovered) {
            return styles.municipalities.overlay.active.fillColor;
          } else if (hasInteraction) {
            return styles.municipalities.overlay.inactive.fillColor;
          }
          return styles.municipalities.overlay.default.fillColor;
        },
        getLineColor: (d) => {
          const id = d?.id?.toString();
          const isActive = activeId === id;
          const isHovered =
            hovered?.type === "municipality" && hovered.id === id;

          if (isActive || isHovered) {
            return styles.municipalities.overlay.active.lineColor;
          }
          return styles.municipalities.overlay.default.lineColor;
        },
        getLineWidth: (d) => {
          const id = d?.id?.toString();
          const isActive = activeId === id;
          const isHovered =
            hovered?.type === "municipality" && hovered.id === id;

          if (isActive || isHovered) {
            return styles.municipalities.overlay.active.lineWidth;
          }
          return styles.municipalities.overlay.default.lineWidth;
        },
        lineWidthUnits: "pixels",
        updateTriggers: {
          getFillColor: [hovered, activeId],
          getLineColor: [hovered, activeId],
          getLineWidth: [hovered, activeId],
        },
      }),
    ];
  }, [
    geoData.state,
    geoData.data,
    observationsByMunicipalityId,
    highlightContext?.id,
    hovered,
    activeId,
    indexes,
    onEntitySelect,
    colorScale,
  ]);

  const formatCurrency = useFormatCurrency();

  const renderLegend = useCallback(() => {
    if (!valuesExtent || !medianValue || !colorScale) return null;
    const legendData = [valuesExtent[0], medianValue, valuesExtent[1]];
    return (
      <MapColorLegend
        id={legendId}
        title={
          <Trans id="map.legend.title">
            Tariff comparison in Rp./kWh (figures excl. VAT)
          </Trans>
        }
        ticks={legendData.map((value) => ({
          value,
          label: value !== undefined ? formatCurrency(value) : "",
        }))}
        infoDialogButtonProps={{
          slug: "help-price-comparison",
          label: t({
            id: "help.price-comparison",
            message: "Tariff comparison",
          }),
        }}
      />
    );
  }, [valuesExtent, medianValue, colorScale, legendId, formatCurrency]);

  return (
    <GenericMap
      layers={(layers as unknown as Layer[]) || []}
      isLoading={geoData.state === "fetching" || observationsQueryFetching}
      hasNoData={observations.length === 0}
      hasError={geoData.state === "error"}
      tooltipContent={tooltipContent}
      legend={renderLegend()}
      downloadId={DOWNLOAD_ID}
      controls={controls}
      getEntityFromHighlight={getEntityFromHighlight}
      setHovered={setHovered}
    />
  );
};

export type EnergyPricesMapProps = ComponentProps<typeof EnergyPricesMap>;
