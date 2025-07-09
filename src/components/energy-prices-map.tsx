import { Layer, PickingInfo } from "@deck.gl/core/typed";
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
import { HoverState } from "src/components/map-helpers";
import {
  makeEnergyPricesCantonsLayer,
  makeEnergyPricesLakesLayer,
  makeEnergyPricesMunicipalitiesBaseLayer,
  makeEnergyPricesMunicipalitiesOverlayLayer,
  makeEnergyPricesMunicipalityMeshLayer,
} from "src/components/map-layers";
import { MapTooltipContent } from "src/components/map-tooltip";
import { useGeoData } from "src/data/geo";
import { useFormatCurrency } from "src/domain/helpers";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";
import { maxBy } from "src/lib/array";

import { GenericMap, GenericMapControls } from "./generic-map";
import { useMap } from "./map-context";

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
  controls?: GenericMapControls;
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

    const handleMunicipalityLayerClick = (info: PickingInfo, ev: unknown) => {
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

    const handleHover = ({ x, y, object }: PickingInfo) => {
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
    };

    return [
      makeEnergyPricesMunicipalitiesBaseLayer({
        data: geoData.data.municipalities,
        observationsByMunicipalityId,
        colorScale,
        highlightId: highlightContext?.id,
        onHover: handleHover,
        onClick: handleMunicipalityLayerClick,
      }),
      makeEnergyPricesMunicipalityMeshLayer({
        data: geoData.data.municipalityMesh,
      }),
      makeEnergyPricesLakesLayer({
        data: geoData.data.lakes,
      }),
      makeEnergyPricesCantonsLayer({
        data: geoData.data.cantonMesh,
      }),
      makeEnergyPricesMunicipalitiesOverlayLayer({
        data: geoData.data.municipalities,
        hovered,
        activeId: activeId ?? undefined,
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
          <Trans id="energy-prices-map.legend.title">
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
