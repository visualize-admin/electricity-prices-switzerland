import { ScaleThreshold } from "d3";
import { useMemo } from "react";

import { Entity } from "src/domain/data";
import { useQueryStateSunshineMap } from "src/domain/query-states";
import { getLocalizedLabel } from "src/domain/translation";
import {
  EnrichedEnergyObservation,
  EnrichedEnergyPricesData,
} from "src/hooks/use-enriched-energy-prices-data";
import {
  EnrichedSunshineData,
  EnrichedSunshineObservation,
} from "src/hooks/use-enriched-sunshine-data";
import { truthy } from "src/lib/truthy";
import {
  formatEnergyPricesEntity,
  formatSunshineEntity,
} from "src/utils/entity-formatting";

export interface EntitySelection {
  hoveredId: string | null;
  selectedId: string | null;
  entityType: Entity;
}

interface UseSelectedEntityDataOptions {
  selection: EntitySelection;
  dataType: "energy-prices" | "sunshine";
  enrichedData: EnrichedEnergyPricesData | EnrichedSunshineData | null;
  colorScale?: ScaleThreshold<number, string>;
  formatValue?: (value: number) => string;
  priceComponent: string;
}

interface SelectedEntityData {
  entityId: string | null;
  isHovered: boolean;
  isSelected: boolean;
  formattedData:
    | ReturnType<typeof formatEnergyPricesEntity>
    | ReturnType<typeof formatSunshineEntity>
    | null;
  observations:
    | EnrichedEnergyObservation[]
    | EnrichedSunshineObservation[]
    | null;
}

/**
 * Unified hook for managing entity selection and data formatting across map components.
 * Handles the priority logic: selected ID takes precedence over hovered ID.
 *
 * @param options Configuration for entity selection and data formatting
 * @returns Selected entity data with formatting and metadata
 */
export function useSelectedEntityData(
  options: UseSelectedEntityDataOptions
): SelectedEntityData {
  const [queryState] = useQueryStateSunshineMap();
  const {
    selection,
    dataType,
    enrichedData,
    colorScale,
    formatValue,
    priceComponent,
  } = options;

  // Determine the active entity ID (selected takes precedence over hovered)
  const entityId = selection.selectedId || selection.hoveredId;

  return useMemo(() => {
    // No entity selected
    if (!entityId) {
      return {
        entityId: null,
        isHovered: false,
        isSelected: false,
        formattedData: null,
        observations: null,
      };
    }

    const isHovered = selection.hoveredId === entityId;
    const isSelected = selection.selectedId === entityId;

    // Check if data is available
    if (!enrichedData || !colorScale || !formatValue) {
      return {
        entityId,
        isHovered,
        isSelected,
        formattedData: null,
        observations: null,
      };
    }

    // Handle energy prices data
    if (dataType === "energy-prices") {
      const energyData = enrichedData as EnrichedEnergyPricesData;
      const entityType = selection.entityType;

      // Use the pre-built indexes for efficient lookup
      const municipalityObservations =
        energyData.observationsByMunicipality.get(entityId);
      const cantonObservations = [
        energyData.cantonMedianObservationsByCanton.get(entityId),
      ].filter(truthy);

      const entityObservations =
        (entityType === "municipality"
          ? municipalityObservations
          : cantonObservations) ?? [];

      if (entityObservations.length === 0) {
        return {
          entityId,
          isHovered,
          isSelected,
          formattedData: null,
          observations: null,
        };
      }

      const formattedData = formatEnergyPricesEntity(
        entityObservations,
        entityType,
        colorScale,
        formatValue,
        getLocalizedLabel({ id: priceComponent })
      );

      return {
        entityId,
        isHovered,
        isSelected,
        formattedData,
        observations: entityObservations,
      };
    }

    // Handle sunshine data
    if (dataType === "sunshine") {
      const sunshineData = enrichedData as EnrichedSunshineData;

      // Use the pre-built indexes for efficient lookup
      const operatorObservations =
        sunshineData.observationsByOperator.get(entityId);

      if (!operatorObservations || operatorObservations.length === 0) {
        return {
          entityId,
          isHovered,
          isSelected,
          formattedData: null,
          observations: null,
        };
      }

      const formattedData = formatSunshineEntity(
        operatorObservations,
        colorScale,
        formatValue,
        getLocalizedLabel({ id: queryState.indicator })
      );

      return {
        entityId,
        isHovered,
        isSelected,
        formattedData,
        observations: operatorObservations,
      };
    }

    // Fallback for unknown data types
    return {
      entityId,
      isHovered,
      isSelected,
      formattedData: null,
      observations: null,
    };
  }, [
    entityId,
    selection.hoveredId,
    selection.selectedId,
    selection.entityType,
    enrichedData,
    colorScale,
    formatValue,
    dataType,
    priceComponent,
    queryState.indicator,
  ]);
}
