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
import { Entity, PriceComponent } from "src/domain/data";
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
  entity,
  setEntity,
  widgets,
}: {
  enrichedDataQuery: ReturnType<typeof useEnrichedEnergyPricesData>;
  colorScale: ScaleThreshold<number, string> | undefined;
  controls?: GenericMapControls;
  period: string;
  priceComponent: PriceComponent;
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
    electricityCategory: undefined, // Energy prices doesn't use category filtering for operators
    networkLevel: undefined,
    pause: !(entity === "operator" && enrichedData),
  });

  // Use aggregated operator observations from enriched data
  const observationsByOperator = useMemo(
    () => enrichedData?.observationsByOperatorAggregated ?? {},
    [enrichedData],
  );

  // Create entity selection for unified hook
  const entitySelection: EntitySelection = useMemo(
    () => ({
      hoveredIds:
        hovered?.type === "municipality" || hovered?.type === "canton"
          ? [hovered.id.toString()]
          : hovered?.type === "operator" && hovered.id
            ? [hovered.id.toString()]
            : null,
      selectedId: null,
      entityType:
        hovered?.type === "municipality"
          ? "municipality"
          : hovered?.type === "canton"
            ? "canton"
            : "operator",
    }),
    [hovered],
  );

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
    };
  }, [geoData]);

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
      if (!featureIndexes || !id) {
        return;
      }

      // Handle operator highlights
      if (type === "operator" && operatorFeatureResult.data?.features) {
        return operatorFeatureResult.data.features
          .filter(isOperatorFeature)
          .find((feature) =>
            feature.properties.operators.some(
              (operatorId) => operatorId.toString() === id,
            ),
          );
      }

      // Handle municipality/canton highlights
      const index =
        type === "canton"
          ? featureIndexes.cantons
          : type === "municipality"
            ? featureIndexes.municipalities
            : undefined;
      const entity = index?.get(parseInt(id, 10));
      return entity;
    },
    [featureIndexes, operatorFeatureResult.data?.features],
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
        const type =
          info.layer.id === "municipalities" || info.layer.id === "cantons-base"
            ? info.layer.id === "municipalities"
              ? "municipality"
              : "canton"
            : "operator";

        // For energy prices, we currently only handle municipality navigation
        if (
          type === "municipality" &&
          !enrichedData?.observationsByMunicipality.get(`${id}`)
        ) {
          return;
        }

        setEntity(type === "canton" ? "canton" : "municipality");
        onEntitySelect(
          ev.srcEvent as MouseEvent,
          type === "canton" ? "canton" : "municipality",
          id.toString(),
        );
      };

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

        if (!object || (!id && entity !== "operator")) {
          setHovered(undefined);
          return;
        }

        // Handle operator hover differently
        if (entity === "operator") {
          const tObject = object as OperatorFeature;
          const operatorIds = tObject.properties?.operators ?? [];
          const id = `${operatorIds[0]}`;
          setHovered({
            x,
            y,
            id,
            type: "operator",
            values: operatorIds.map((operatorId: number) => ({
              operatorName: operatorId.toString(), // TODO: Get actual operator name
              value: 0, // TODO: Get actual value from observations
            })),
          });
          return;
        }

        if (id) {
          setHovered({
            x,
            y,
            id,
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
