import { ScaleThreshold } from "d3";
import { isEqual } from "lodash";
import { useMemo } from "react";

import { Entity, PriceComponent } from "src/domain/data";
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
  hoveredIds: string[] | null;
  selectedId: string | null;
  entityType: Entity;
}

interface UseSelectedEntityDataOptions {
  selection: EntitySelection;
  dataType: "energy-prices" | "sunshine";
  enrichedData: EnrichedEnergyPricesData | EnrichedSunshineData | null;
  colorScale?: ScaleThreshold<number, string>;
  formatValue?: (value: number) => string;
  priceComponent: PriceComponent;
}

interface SelectedEntityData {
  entityIds: string[] | null;
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

const isEqualWithoutOrder = (arr1: string[] | null, arr2: string[] | null) => {
  if (arr1 === null && arr2 === null) return true;
  if (arr1 === null || arr2 === null) return false;
  if (arr1.length !== arr2.length) return false;
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return isEqual(sortedArr1, sortedArr2);
};

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
  const [{ indicator }] = useQueryStateSunshineMap();
  const {
    selection,
    dataType,
    enrichedData,
    colorScale,
    formatValue,
    priceComponent,
  } = options;

  // Determine the active entity ID (selected takes precedence over hovered)
  const entityIds = useMemo(
    () =>
      selection.hoveredIds
        ? selection.hoveredIds
        : selection.selectedId
        ? [selection.selectedId]
        : null,
    [selection.hoveredIds, selection.selectedId]
  );

  return useMemo(() => {
    // No entity selected
    if (!entityIds || entityIds.length === 0) {
      return {
        entityIds: null,
        isHovered: false,
        isSelected: false,
        formattedData: null,
        observations: null,
      };
    }

    const isHovered = isEqualWithoutOrder(selection.hoveredIds, entityIds);
    const isSelected = isEqualWithoutOrder(
      selection.selectedId ? [selection.selectedId] : null,
      entityIds
    );

    // Check if data is available
    if (!enrichedData || !colorScale || !formatValue) {
      return {
        entityIds,
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
      const municipalityObservations = entityIds
        .flatMap(
          (entityId) =>
            energyData.observationsByMunicipality.get(entityId) ?? []
        )
        .filter(truthy);
      const cantonObservations = entityIds
        .flatMap(
          (entityId) =>
            energyData.cantonMedianObservationsByCanton.get(entityId) ?? []
        )
        .filter(truthy);
      const entityObservations =
        (entityType === "municipality"
          ? municipalityObservations
          : cantonObservations) ?? [];

      if (entityObservations.length === 0) {
        return {
          entityIds,
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
        entityIds,
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
      const operatorObservations = entityIds
        .flatMap(
          (entityId) => sunshineData.observationsByOperator.get(entityId) ?? []
        )
        .filter(truthy);

      if (!operatorObservations || operatorObservations.length === 0) {
        return {
          entityIds,
          isHovered,
          isSelected,
          formattedData: null,
          observations: null,
        };
      }

      const formattedData = formatSunshineEntity(
        selection.entityType === "municipality" ? "municipality" : "operator",
        operatorObservations,
        colorScale,
        formatValue,
        getLocalizedLabel({ id: indicator })
      );

      return {
        entityIds,
        isHovered,
        isSelected,
        formattedData,
        observations: operatorObservations,
      };
    }

    // Fallback for unknown data types
    return {
      entityIds,
      isHovered,
      isSelected,
      formattedData: null,
      observations: null,
    };
  }, [
    entityIds,
    selection.hoveredIds,
    selection.selectedId,
    selection.entityType,
    enrichedData,
    colorScale,
    formatValue,
    dataType,
    priceComponent,
    indicator,
  ]);
}
