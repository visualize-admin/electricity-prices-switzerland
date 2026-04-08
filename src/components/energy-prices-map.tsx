import { Layer, PickingInfo } from "@deck.gl/core/typed";
import { Trans, t } from "@lingui/macro";
import { index, ScaleThreshold } from "d3";
import {
  ComponentProps,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";

import { MapColorLegend } from "src/components/color-legend";
import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { HoverState, MapRenderMode } from "src/components/map-helpers";
import {
  makeCantonsLayer,
  makeEnergyPricesOverlayLayer,
  makeLakesLayer,
  makeMunicipalityLayer,
  makeSunshineOperatorLayer,
  makeSunshineOperatorPickableLayer,
  PickingInfoTyped,
} from "src/components/map-layers";
import { SelectedEntityCard } from "src/components/map-tooltip";
import {
  CantonFeatureCollection,
  isOperatorFeature,
  MunicipalityFeatureCollection,
  OperatorFeature,
  useGeoData,
} from "src/data/geo";
import { ElectricityCategory, Entity, PriceComponent } from "src/domain/data";
import { useFormatCurrency } from "src/domain/helpers";
import { thresholdEncodings } from "src/domain/map-encodings";
import { PriceComponent as PriceComponentEnum } from "src/graphql/resolver-types";
import { useEnrichedEnergyPricesData } from "src/hooks/use-enriched-energy-prices-data";
import { useOperatorFeatureCollection } from "src/hooks/use-operator-feature-collection";
import {
  EntitySelection,
  useSelectedEntityData,
} from "src/hooks/use-selected-entity-data";
import { truthy } from "src/lib/truthy";
import { combineErrors } from "src/utils/combine-errors";

import { GenericMap, GenericMapControls, GenericMapProps } from "./generic-map";
import { useMap } from "./map-context";

const DOWNLOAD_ID = "map";

export const EnergyPricesMap = ({
  enrichedDataQuery,
  colorScale,
  controls,
  period,
  priceComponent,
  category,
  entity,
  setEntity,
  widgets,
}: {
  enrichedDataQuery: ReturnType<typeof useEnrichedEnergyPricesData>;
  colorScale: ScaleThreshold<number, string> | undefined;
  controls?: GenericMapControls;
  period: string;
  priceComponent: PriceComponent;
  category: ElectricityCategory;
  entity: Entity;
  setEntity: (entity: Entity) => void;
  widgets?: GenericMapProps["widgets"];
}) => {
  const [hovered, setHovered] = useState<HoverState>();
  const { activeId, onEntitySelect } = useMap();
  const legendId = useId();
  const formatNumber = useFormatCurrency();

  const geoData = useGeoData(period);

  const { data: enrichedData, fetching, error } = enrichedDataQuery;

  // Get operator feature collection for operator view
  const operatorFeatureResult = useOperatorFeatureCollection({
    period,
    electricityCategory: category,
    networkLevel: undefined,
    pause: !(entity === "operator" && enrichedData),
  });

  // Use aggregated operator observations from enriched data
  const observationsByOperator = useMemo(
    () => enrichedData?.observationsByOperatorAggregated ?? {},
    [enrichedData],
  );

  // Create entity selection for unified hook
  const entitySelection: EntitySelection = useMemo(() => {
    if (!hovered?.type) {
      return { hoveredIds: null, selectedId: null, entityType: "municipality" };
    }
    return {
      hoveredIds: [hovered.id],
      selectedId: null,
      entityType: hovered.type,
    };
  }, [hovered]);

  // Use the selected entity data hook
  const selectedEntityData = useSelectedEntityData({
    selection: entitySelection,
    dataType: "energy-prices",
    enrichedData: enrichedData,
    colorScale: colorScale!,
    formatValue: formatNumber,
    priceComponent: priceComponent,
  });

  const { value: highlightContext } = useContext(HighlightContext);

  const featureIndexes = useMemo(() => {
    if (geoData.state !== "loaded") {
      return;
    }
    const municipalities = geoData.data.municipalities;
    const cantons = geoData.data.cantons;
    return {
      municipalities: index(municipalities?.features ?? [], (x) => x.id),
      cantons: index(cantons?.features ?? [], (x) => x.id),
      operators: new Map(
        operatorFeatureResult.data?.features
          .map((f) => {
            if (!isOperatorFeature(f) || f.properties.operators.length !== 1) {
              return null;
            }
            return [f.properties.operators[0], f] as const;
          })
          .filter(truthy) ?? [],
      ),
    };
  }, [geoData, operatorFeatureResult.data?.features]);

  const tooltipContent = useMemo(() => {
    if (!selectedEntityData.formattedData) {
      return null;
    }

    const content = (
      <SelectedEntityCard {...selectedEntityData.formattedData} />
    );

    return {
      hoveredState: hovered,
      content: content,
    };
  }, [selectedEntityData.formattedData, hovered]);

  const getEntityFromHighlight = useCallback(
    (highlight: HighlightValue) => {
      const { entity: type, id } = highlight;
      if (!id || !featureIndexes) return;

      const idx =
        type === "operator"
          ? featureIndexes.operators
          : type === "canton"
            ? featureIndexes.cantons
            : featureIndexes.municipalities;
      return idx?.get(parseInt(id, 10));
    },
    [featureIndexes],
  );

  const makeLayers = useCallback(
    (renderMode: MapRenderMode) => {
      if (geoData.state !== "loaded") {
        return [];
      }

      const handleMunicipalityLayerClick = (
        info: PickingInfo,
        ev: { srcEvent: Event },
      ) => {
        if (!featureIndexes || !info.layer) return;
        const id = info.object.id as number;
        const type: Entity =
          info.layer.id === "municipalities" ? "municipality" : "canton";

        setEntity(type);
        onEntitySelect(ev.srcEvent as MouseEvent, type, id.toString());
      };

      // Operator features don't set a GeoJSON top-level id; the entity ID is
      // stored in properties.operators[0] because a single geographic area can
      // represent multiple operators. This requires a separate handler from
      // handleMunicipalityLayerClick which reads info.object.id.
      const handleOperatorLayerClick = (
        info: PickingInfo,
        ev: { srcEvent: Event },
      ) => {
        if (!info.object) return;
        const operatorId = info.object.properties?.operators?.[0];
        if (!operatorId) return;

        setEntity("operator");
        onEntitySelect(
          ev.srcEvent as MouseEvent,
          "operator",
          operatorId.toString(),
        );
      };

      const handleHover = (_info: PickingInfo) => {
        const info = _info as PickingInfoTyped<
          | MunicipalityFeatureCollection["features"][number]
          | CantonFeatureCollection["features"][number]
          | OperatorFeature
        >;
        const { x, y, object } = info;
        const id = object?.id?.toString();
        const effectiveId =
          entity === "operator"
            ? (
                object as OperatorFeature
              )?.properties?.operators?.[0]?.toString()
            : id;

        if (effectiveId) {
          setHovered({
            x,
            y,
            id: effectiveId,
            type: entity,
          });
        } else {
          setHovered(undefined);
        }
      };

      return [
        entity === "municipality" && enrichedData
          ? makeMunicipalityLayer({
              data: geoData.data.municipalities,
              observationsByMunicipalityId:
                enrichedData.observationsByMunicipality,
              colorScale,
              highlightId:
                highlightContext?.entity === "municipality"
                  ? highlightContext.id
                  : undefined,
              onHover: handleHover,
              onClick: handleMunicipalityLayerClick,
              layerId: "municipalities-base",
              mode: "base",
              renderMode,
            })
          : null,

        entity === "canton" && enrichedData
          ? makeMunicipalityLayer({
              data: geoData.data.cantons,
              observationsByMunicipalityId: enrichedData.observationsByCanton,
              colorScale,
              highlightId:
                highlightContext?.entity === "canton"
                  ? highlightContext.id
                  : undefined,
              onHover: handleHover,
              onClick: handleMunicipalityLayerClick,
              layerId: "cantons-base",
              mode: "base",
              renderMode,
            })
          : null,
        entity === "operator" &&
        operatorFeatureResult.data?.features &&
        observationsByOperator &&
        colorScale
          ? makeSunshineOperatorLayer({
              data: operatorFeatureResult.data.features.filter((f) => {
                return f.properties.operators.some(
                  (operatorId) =>
                    operatorId.toString() in observationsByOperator,
                );
              }),
              accessor: (obs) => obs.value ?? 0,
              observationsByOperator,
              colorScale,
              renderMode,
            })
          : null,

        makeMunicipalityLayer({
          data: geoData.data.municipalityMesh,
          layerId: "municipality-mesh",
          mode: "mesh",
          renderMode,
        }),
        makeLakesLayer({ data: geoData.data.lakes, renderMode }),
        makeCantonsLayer({ data: geoData.data.cantonMesh, renderMode }),
        // Overlay layer for canton highlights - only show when cantons are selected
        entity === "canton" &&
          makeEnergyPricesOverlayLayer({
            data: geoData.data.cantons,
            hovered,
            activeId: activeId ?? undefined,
            type: "canton",
            renderMode,
          }),
        // Overlay layer for municipality highlights - only show when municipalities are selected
        entity === "municipality" &&
          makeEnergyPricesOverlayLayer({
            data: geoData.data.municipalities,
            hovered,
            activeId: activeId ?? undefined,
            type: "municipality",
            renderMode,
          }),
        // Overlay layer for operator highlights - only show when operators are selected and we have the necessary data
        entity === "operator" &&
        operatorFeatureResult.data?.features &&
        observationsByOperator &&
        colorScale
          ? makeSunshineOperatorPickableLayer({
              data: operatorFeatureResult.data.features.filter((f) => {
                return f.properties.operators.some(
                  (operatorId) =>
                    operatorId.toString() in observationsByOperator,
                );
              }),
              accessor: (_obs) => 10, // Fixed value for pickable layer
              observationsByOperator,
              hovered,
              activeId: activeId ?? undefined,
              onHover: handleHover,
              onClick: handleOperatorLayerClick,
              renderMode,
            })
          : null,
      ].filter(truthy);
    },
    [
      geoData.state,
      geoData.data,
      enrichedData,
      colorScale,
      highlightContext?.entity,
      highlightContext?.id,
      hovered,
      activeId,
      entity,
      operatorFeatureResult.data,
      observationsByOperator,
      featureIndexes,
      setEntity,
      onEntitySelect,
    ],
  );

  const layers = useMemo(() => makeLayers("screen"), [makeLayers]);

  const formatCurrency = useFormatCurrency();

  const renderLegend = useCallback(() => {
    const medianValue = enrichedData?.medianValue;
    const valuesExtent = enrichedData?.valuesExtent;
    const observations = enrichedData?.observations;
    if (!valuesExtent || !medianValue || !colorScale || !observations)
      return null;
    const legendData = [valuesExtent[0], medianValue, valuesExtent[1]];

    // Get the threshold encoding function and generate thresholds and palette from a single source
    const thresholdEncoding = thresholdEncodings.energyPrices;
    const isValidValue = <T extends { value?: number | null | undefined }>(
      x: T,
    ): x is T & { value: number } => x.value !== undefined && x.value !== null;
    const values = observations.filter(isValidValue).map((o) => o.value);
    const { thresholds, palette } = thresholdEncoding(
      medianValue,
      values,
      +period,
    );

    return (
      <MapColorLegend
        id={legendId}
        title={
          priceComponent === PriceComponentEnum.Annualmeteringcost ? (
            <Trans id="energy-prices-map.legend.title-annualmeteringcost">
              Tariff comparison in CHF / year
            </Trans>
          ) : (
            <Trans id="energy-prices-map.legend.title">
              Tariff comparison in Rp./kWh (figures excl. VAT)
            </Trans>
          )
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
        palette={palette}
        thresholds={thresholds}
      />
    );
  }, [
    enrichedData?.medianValue,
    enrichedData?.valuesExtent,
    enrichedData?.observations,
    colorScale,
    legendId,
    priceComponent,
    formatCurrency,
    period,
  ]);

  return (
    <GenericMap
      layers={(layers as unknown as Layer[]) || []}
      makeScreenshotLayers={makeLayers as (mode: MapRenderMode) => Layer[]}
      isLoading={
        geoData.state === "fetching" ||
        fetching ||
        (entity === "operator" && operatorFeatureResult.fetching)
      }
      hasNoData={!enrichedData?.observations.length}
      error={combineErrors(
        [
          geoData.state === "error"
            ? geoData.error instanceof Error
              ? { error: geoData.error, label: "GeoData" }
              : { message: "Unknown geoData error" }
            : undefined,
          error ? { error: error, label: "Data" } : undefined,
          entity === "operator" && operatorFeatureResult.error
            ? {
                error: { message: "Failed to load operator data" },
                label: "Operator Data",
              }
            : undefined,
        ].filter(truthy),
      )}
      tooltipContent={tooltipContent}
      legend={renderLegend()}
      downloadId={DOWNLOAD_ID}
      controls={controls}
      getEntityFromHighlight={getEntityFromHighlight}
      setHovered={setHovered}
      widgets={widgets}
    />
  );
};

export type EnergyPricesMapProps = ComponentProps<typeof EnergyPricesMap>;
