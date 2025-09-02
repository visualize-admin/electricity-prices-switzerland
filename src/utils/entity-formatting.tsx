import { Trans } from "@lingui/macro";
import { ScaleThreshold } from "d3";
import React from "react";

import { SunshineIndicator } from "src/domain/sunshine";
import { EnrichedEnergyObservation } from "src/hooks/useEnrichedEnergyPricesData";
import { EnrichedSunshineObservation } from "src/hooks/useEnrichedSunshineData";

// Core entity types for unified handling
export type EntityType = "municipality" | "canton" | "operator";

export interface SelectedEntityData {
  id: string;
  type: EntityType;
  title: string;
  caption: React.ReactNode;
  values: EntityValue[];
}

export interface EntityValue {
  label: string;
  formattedValue: string;
  color: string;
}

export interface EntityDisplayData {
  title: React.ReactNode;
  caption: React.ReactNode;
  values: EntityValue[];
}

/**
 * Format energy prices entity data for display.
 * Works with enriched energy price observations.
 */
export const formatEnergyPricesEntity = (
  observations: EnrichedEnergyObservation[],
  entityType: EntityType,
  colorScale: ScaleThreshold<number, string, never>,
  formatValue: (value: number) => string,
  coverageRatioFlag = false
): EntityDisplayData => {
  if (!observations || observations.length === 0) {
    return {
      title: "No data",
      caption: getEntityCaption(entityType),
      values: [],
    };
  }

  // Get entity information from the first observation
  const firstObs = observations[0];
  let title = "Unknown";

  if (entityType === "municipality") {
    title = `${
      firstObs.municipalityData?.name ||
      firstObs.municipalityLabel ||
      "Unknown Municipality"
    }${
      firstObs.cantonData?.name || firstObs.cantonLabel
        ? ` - ${firstObs.cantonData?.name || firstObs.cantonLabel}`
        : ""
    }`;
  } else if (entityType === "canton") {
    title =
      firstObs.cantonData?.name || firstObs.cantonLabel || "Unknown Canton";
  } else if (entityType === "operator") {
    title = firstObs.operatorLabel || "Unknown Operator";
  }

  // Create values array from observations
  const values: EntityValue[] = observations.map((obs) => ({
    label: obs.operatorLabel || "",
    formattedValue: `${
      obs.value !== undefined && obs.value !== null
        ? formatValue(obs.value)
        : ""
    }${coverageRatioFlag ? ` (ratio: ${obs.coverageRatio})` : ""}`,
    color:
      obs.value !== undefined && obs.value !== null
        ? colorScale(obs.value)
        : "",
  }));

  return {
    title,
    caption: getEntityCaption(entityType),
    values,
  };
};

/**
 * Format sunshine entity data for display.
 * Works with enriched sunshine observations.
 */
export const formatSunshineEntity = (
  observations: EnrichedSunshineObservation[],
  colorScale: ScaleThreshold<number, string, never>,
  formatValue: (value: number) => string,
  indicator: SunshineIndicator
): EntityDisplayData => {
  if (!observations || observations.length === 0) {
    return {
      title: "No data",
      caption: getEntityCaption("operator"),
      values: [],
    };
  }

  // Create values array from observations
  const values: EntityValue[] = observations
    .filter((obs) => obs.value !== null && obs.value !== undefined)
    .map((obs) => ({
      label: `${indicator}`,
      formattedValue: formatValue(obs.value!),
      color: colorScale(obs.value!),
    }));

  return {
    title: observations[0].operatorData?.name, // Sunshine entities don't have a specific title
    caption: getEntityCaption("operator"),
    values,
  };
};

/**
 * Get the appropriate caption for an entity type.
 */
const getEntityCaption = (entityType: EntityType): React.ReactNode => {
  switch (entityType) {
    case "municipality":
      return <Trans id="municipality">Municipality</Trans>;
    case "canton":
      return <Trans id="canton">Canton</Trans>;
    case "operator":
      return <Trans id="operator">Operator</Trans>;
    default:
      return <Trans id="entity">Entity</Trans>;
  }
};
