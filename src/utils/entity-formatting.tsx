import { Trans } from "@lingui/macro";
import { ScaleThreshold } from "d3";
import React from "react";

import { Entity } from "src/domain/data";
import { EnrichedEnergyObservation } from "src/hooks/use-enriched-energy-prices-data";
import { EnrichedSunshineObservation } from "src/hooks/use-enriched-sunshine-data";

// Core entity types for unified handling
interface EntityValue {
  label: string;
  formattedValue: string;
  color: string;
}

interface EntityDisplayData {
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
  entityType: Entity,
  colorScale: ScaleThreshold<number, string, never>,
  formatValue: (value: number) => string,
  priceComponent: string,
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
  let title: null | string = null;

  if (entityType === "municipality") {
    title = null;
  } else if (entityType === "canton") {
    title = firstObs.cantonData?.name || firstObs.cantonLabel || null;
  } else if (entityType === "operator") {
    title = firstObs.operatorLabel || null;
  }

  // Create values array from observations
  const values: EntityValue[] = observations.map((obs) => ({
    label: obs.operatorLabel ?? priceComponent ?? "",
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
  entity: Entity,
  observations: EnrichedSunshineObservation[],
  colorScale: ScaleThreshold<number, string, never>,
  formatValue: (value: number) => string,
  formattedIndicator: string
): EntityDisplayData => {
  if (!observations || observations.length === 0) {
    return {
      title: "No data",
      caption: getEntityCaption(entity),
      values: [],
    };
  }

  // Create values array from observations
  const values: EntityValue[] = observations
    .filter((obs) => obs.value !== null && obs.value !== undefined)
    .map((obs) => ({
      label:
        entity === "municipality"
          ? obs.operatorData?.name ?? ""
          : formattedIndicator,
      formattedValue: formatValue(obs.value!),
      color: colorScale(obs.value!),
    }));

  return {
    title:
      entity === "municipality"
        ? null
        : observations[0].operatorData?.name || "Unknown Operator",
    caption: entity === "municipality" ? null : getEntityCaption(entity),
    values,
  };
};

/**
 * Get the appropriate caption for an entity type.
 */
const getEntityCaption = (entityType: Entity): React.ReactNode => {
  switch (entityType) {
    case "municipality":
      return <Trans id="municipality">Municipality</Trans>;
    case "canton":
      return <Trans id="canton">Canton</Trans>;
    case "operator":
      return <Trans id="operator">Operator</Trans>;
    default:
      return "";
  }
};
