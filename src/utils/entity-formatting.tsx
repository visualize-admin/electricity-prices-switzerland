import { i18n } from "@lingui/core";
import { Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { ScaleThreshold } from "d3";
import React from "react";

import { Entity, NetworkLevelId } from "src/domain/data";
import { RP_PER_KWH } from "src/domain/metrics";
import { SunshineIndicator } from "src/domain/sunshine";
import { getSunshineMapMetricLegendParts } from "src/domain/translation";
import { EnrichedEnergyObservation } from "src/hooks/use-enriched-energy-prices-data";
import { EnrichedSunshineObservation } from "src/hooks/use-enriched-sunshine-data";
import { EntitySelection } from "src/hooks/use-selected-entity-data";

interface EntityValue {
  label: string;
  /** Map tooltip: muted `(unit)` after label; chip shows `formattedValue` only. */
  unit?: string;
  formattedValue: string;
  color: string;
}

interface EntityDisplayData {
  title: React.ReactNode;
  /** Sunshine multi-operator: metric under title (Figma). */
  subtitle?: React.ReactNode;
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

  const firstObs = observations[0];
  let title: null | string = null;

  if (entityType === "municipality") {
    title =
      firstObs.municipalityData?.name || firstObs.municipalityLabel || null;
  } else if (entityType === "canton") {
    title = firstObs.cantonData?.name || firstObs.cantonLabel || null;
  } else if (entityType === "operator") {
    title = firstObs.operatorLabel || null;
  }

  const unit = i18n._(RP_PER_KWH);

  const values: EntityValue[] = observations.map((obs) => ({
    label:
      entityType === "municipality"
        ? obs.operatorLabel ?? priceComponent ?? ""
        : priceComponent ?? "",
    unit,
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
  selection: EntitySelection,
  observations: EnrichedSunshineObservation[],
  colorScale: ScaleThreshold<number, string, never>,
  formatValue: (value: number) => string,
  indicator: SunshineIndicator,
  networkLevel?: NetworkLevelId
): EntityDisplayData => {
  const { entityType: entity } = selection;

  if (!observations || observations.length === 0) {
    return {
      title: "No data",
      caption: getEntityCaption(entity),
      values: [],
    };
  }

  const multipleOperators =
    new Set(observations.map((obs) => obs.operatorId)).size > 1;

  const { metricLabel, metricUnit } = getSunshineMapMetricLegendParts(
    indicator,
    networkLevel
  );

  const subtitle =
    multipleOperators && metricUnit !== null ? (
      <>
        <Box component="span" sx={{ color: "text.primary" }}>
          {metricLabel}
        </Box>
        <Box component="span" sx={{ color: "text.500" }}>
          {" "}
          ({metricUnit})
        </Box>
      </>
    ) : multipleOperators ? (
      <Box component="span" sx={{ color: "text.primary" }}>
        {metricLabel}
      </Box>
    ) : undefined;

  const values: EntityValue[] = observations
    .filter((obs) => obs.value !== null && obs.value !== undefined)
    .map((obs) => ({
      label: multipleOperators ? obs.operatorData?.name ?? "" : metricLabel,
      unit: multipleOperators ? undefined : metricUnit ?? undefined,
      formattedValue: formatValue(obs.value!),
      color: colorScale(obs.value!),
    }));

  return {
    title: multipleOperators ? (
      <Trans id="map.tooltip.multiple-grid-operators">
        Multiple grid operators
      </Trans>
    ) : (
      observations[0].operatorData?.name || "Unknown Operator"
    ),
    subtitle,
    caption: getEntityCaption(entity),
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
