import { Trans } from "@lingui/macro";
import { ScaleThreshold } from "d3";
import { ComponentProps } from "react";
import React from "react";

import { HoverState } from "src/components/map-helpers";
import { SelectedEntityCard } from "src/components/map-tooltip";
import { FlagValue } from "src/flags";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";
import { maxBy } from "src/lib/array";
import { isDefined } from "src/utils/is-defined";

export type MapTooltipProps = ComponentProps<typeof SelectedEntityCard>;

// Energy prices tooltip data preparation
export const getEnergyPricesTooltipProps = ({
  hovered,
  colorScale,
  observationsByMunicipalityId,
  municipalityNames,
  formatNumber,
  coverageRatioFlag,
}: {
  hovered: HoverState;
  colorScale: ScaleThreshold<number, string>;
  observationsByMunicipalityId: Map<
    string,
    OperatorObservationFieldsFragment[]
  >;
  municipalityNames: Map<string, { id: string; name: string }>;
  formatNumber: (value: number) => string;
  coverageRatioFlag: FlagValue;
}): MapTooltipProps | null => {
  if (hovered.type === "municipality") {
    const hoveredObservations = observationsByMunicipalityId.get(hovered.id);
    const hoveredMunicipalityName = municipalityNames.get(hovered.id)?.name;
    const hoveredCanton = maxBy(
      hoveredObservations,
      (x) => x.period
    )?.cantonLabel;

    const values = hoveredObservations?.length
      ? hoveredObservations.map((d) => ({
          label: d.operatorLabel,
          formattedValue: `${
            d.value !== undefined && d.value !== null
              ? formatNumber(d.value)
              : ""
          }${coverageRatioFlag ? ` (ratio: ${d.coverageRatio})` : ""}`,
          color: isDefined(d.value) ? colorScale(d.value) : "",
        }))
      : [];

    return {
      title: `${hoveredMunicipalityName ?? "-"} ${
        hoveredCanton ? `- ${hoveredCanton}` : ""
      }`,
      caption: <Trans id="municipality">Municipality</Trans>,
      values,
    };
  } else if (hovered.type === "canton") {
    const values = [
      {
        label: "",
        formattedValue: formatNumber(hovered.value),
        color: colorScale(hovered.value),
      },
    ];
    return {
      title: hovered.label,
      caption: <Trans id="canton">Canton</Trans>,
      values,
    };
  }

  return null;
};

// Sunshine tooltip data preparation
export const getSunshineTooltipProps = ({
  hovered,
  valueFormatter,
  colorScale,
}: {
  hovered: Extract<HoverState, { type: "operator" }>;
  valueFormatter: (value: number) => string;
  colorScale: ScaleThreshold<number, string, never>;
}): MapTooltipProps => {
  return {
    title: "",
    caption: <Trans id="operator">Operator</Trans>,
    values: hovered.values.map((x) => ({
      label: x.operatorName,
      formattedValue: valueFormatter(x.value),
      color: colorScale(x.value),
    })),
  };
};

// Generic function to create tooltip props from selectedItem (for MobileControls)
export const getTooltipPropsFromSelectedItem = ({
  selectedItem,
  colorScale,
  formatNumber,
  entity,
}: {
  selectedItem: any; // We'll need to type this properly based on ListItemType
  colorScale: ScaleThreshold<number, string, never>;
  formatNumber: (value: number) => string;
  entity: string;
}): MapTooltipProps | null => {
  if (!selectedItem) {
    return null;
  }

  // This will need to be implemented based on the selectedItem structure
  // For now, returning a placeholder
  return {
    title: selectedItem.label || selectedItem.name || "Unknown",
    caption:
      entity === "municipality" ? (
        <Trans id="municipality">Municipality</Trans>
      ) : entity === "canton" ? (
        <Trans id="canton">Canton</Trans>
      ) : (
        <Trans id="operator">Operator</Trans>
      ),
    values: [
      {
        label: "",
        formattedValue: formatNumber(selectedItem.value || 0),
        color: colorScale(selectedItem.value || 0),
      },
    ],
  };
};
