import { Layer, PickingInfo } from "@deck.gl/core/typed";
import { t, Trans } from "@lingui/macro";
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
import { HoverState } from "src/components/map-helpers";
import {
  makeCantonsLayer,
  makeEnergyPricesOverlayLayer,
  makeLakesLayer,
  makeMunicipalityLayer,
} from "src/components/map-layers";
import { SelectedEntityCard } from "src/components/map-tooltip";
import { useGeoData } from "src/data/geo";
import { PriceComponent } from "src/domain/data";
import { useFormatCurrency } from "src/domain/helpers";
import { PriceComponent as PriceComponentEnum } from "src/graphql/resolver-types";
import { useEnrichedEnergyPricesData } from "src/hooks/use-enriched-energy-prices-data";
import {
  useSelectedEntityData,
  EntitySelection,
} from "src/hooks/use-selected-entity-data";
import { truthy } from "src/lib/truthy";
import { chartPalette } from "src/themes/palette";
import { combineErrors } from "src/utils/combine-errors";

import { GenericMap, GenericMapControls } from "./generic-map";
import { useMap } from "./map-context";

const DOWNLOAD_ID = "map";

export const EnergyPricesMap = ({
  enrichedDataQuery,
  colorScale,
  controls,
  period,
  priceComponent,
}: {
  enrichedDataQuery: ReturnType<typeof useEnrichedEnergyPricesData>;
  colorScale: ScaleThreshold<number, string> | undefined;
  controls?: GenericMapControls;
  period: string;
  priceComponent: PriceComponent;
}) => {
  const [hovered, setHovered] = useState<HoverState>();
  const { activeId, onEntitySelect, setEntity } = useMap();
  const legendId = useId();
  const formatNumber = useFormatCurrency();

  const geoData = useGeoData(period);

  const { data: enrichedData, fetching, error } = enrichedDataQuery;

  // Create entity selection for unified hook
  const entitySelection: EntitySelection = useMemo(
    () => ({
      hoveredIds:
        hovered?.type === "municipality" || hovered?.type === "canton"
          ? [hovered.id.toString()]
          : null,
      selectedId: null,
      entityType: hovered?.type === "municipality" ? "municipality" : "canton",
    }),
    [hovered]
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
      const index =
        type === "canton"
          ? featureIndexes.cantons
          : type === "municipality"
          ? featureIndexes.municipalities
          : undefined;
      const entity = index?.get(parseInt(id, 10));
      return entity;
    },
    [featureIndexes]
  );

  const layers = useMemo(() => {
    if (geoData.state !== "loaded") {
      return [];
    }

    const handleMunicipalityLayerClick = (
      info: PickingInfo,
      ev: { srcEvent: Event }
    ) => {
      if (!featureIndexes || !info.layer) {
        return;
      }
      const id = info.object.id as number;
      const type =
        info.layer.id === "municipalities" ? "municipality" : "canton";
      if (
        type === "municipality" &&
        !enrichedData?.observationsByMunicipality.get(`${id}`)
      ) {
        return;
      }

      setEntity("municipality");
      onEntitySelect(ev.srcEvent as MouseEvent, "municipality", id.toString());
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
      enrichedData
        ? makeMunicipalityLayer({
            data: geoData.data.municipalities,
            observationsByMunicipalityId:
              enrichedData.observationsByMunicipality,
            colorScale,
            highlightId: highlightContext?.id,
            onHover: handleHover,
            onClick: handleMunicipalityLayerClick,
            layerId: "municipalities-base",
            mode: "base",
          })
        : null,
      makeMunicipalityLayer({
        data: geoData.data.municipalityMesh,
        layerId: "municipality-mesh",
        mode: "mesh",
      }),
      makeLakesLayer({
        data: geoData.data.lakes,
      }),
      makeCantonsLayer({
        data: geoData.data.cantonMesh,
      }),
      makeEnergyPricesOverlayLayer({
        data: geoData.data.cantons,
        hovered,
        activeId: activeId ?? undefined,
        type: "canton",
      }),
      makeEnergyPricesOverlayLayer({
        data: geoData.data.municipalities,
        hovered,
        activeId: activeId ?? undefined,
        type: "municipality",
      }),
    ];
  }, [
    geoData.state,
    geoData.data,
    enrichedData,
    colorScale,
    highlightContext?.id,
    hovered,
    activeId,
    featureIndexes,
    setEntity,
    onEntitySelect,
  ]);

  const formatCurrency = useFormatCurrency();

  const renderLegend = useCallback(() => {
    const medianValue = enrichedData?.medianValue;
    const valuesExtent = enrichedData?.valuesExtent;
    if (!valuesExtent || !medianValue || !colorScale) return null;
    const legendData = [valuesExtent[0], medianValue, valuesExtent[1]];
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
        palette={chartPalette.diverging.GreenToOrange}
      />
    );
  }, [
    enrichedData?.medianValue,
    enrichedData?.valuesExtent,
    colorScale,
    legendId,
    priceComponent,
    formatCurrency,
  ]);

  return (
    <GenericMap
      layers={(layers as unknown as Layer[]) || []}
      isLoading={geoData.state === "fetching" || fetching}
      hasNoData={!enrichedData?.observations.length}
      error={combineErrors(
        [
          geoData.state === "error"
            ? geoData.error instanceof Error
              ? { error: geoData.error, label: "GeoData" }
              : { message: "Unknown geoData error" }
            : undefined,
          error ? { error: error, label: "Data" } : undefined,
        ].filter(truthy)
      )}
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
