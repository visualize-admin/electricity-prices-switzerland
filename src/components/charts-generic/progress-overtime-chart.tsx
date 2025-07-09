import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { useMemo } from "react";

import { NoDataHint } from "src/components/hint";
import type { GenericObservation } from "src/domain/data";
import { useFormatCurrency } from "src/domain/helpers";
import { chartPalette, palette as themePalette } from "src/themes/palette";

import { AxisHeightLinear } from "./axis/axis-height-linear";
import { AxisTime } from "./axis/axis-width-time";
import { ChartContainer, ChartSvg } from "./containers";
import { HoverDotMultiple } from "./interaction/hover-dots-multiple";
import { Ruler } from "./interaction/ruler";
import { Tooltip } from "./interaction/tooltip";
import { LegendItem } from "./legends/color";
import { Lines } from "./lines/lines";
import { LineChart } from "./lines/lines-state";
import { InteractionHorizontal } from "./overlay/interaction-horizontal";

export interface ProgressOvertimeChartProps<
  T extends GenericObservation = GenericObservation
> {
  observations: T[];
  operatorLabel: string;
  operatorsNames: Set<string>;
  compareWith?: string[];
  mini?: boolean;
  // Field configuration
  xField: string;
  yField: string;
  yAxisLabel?: string;
  entityField?: string;
  // Palette configuration
  paletteType?: "monochrome" | "elcom2";
  // Interaction configuration
  showInteractionsWhenComparing?: boolean;
  // Legend configuration
  showOtherOperatorsLegend?:
    | boolean
    | ((operatorsNames: Set<string>, compareWith: string[]) => boolean);
  // Data validation
  showNoDataHint?: boolean;
}

export const ProgressOvertimeChart = <T extends GenericObservation>(
  props: ProgressOvertimeChartProps<T>
) => {
  const {
    observations,
    operatorLabel,
    operatorsNames,
    compareWith = [],
    mini = false,
    xField,
    yField,
    yAxisLabel,
    entityField = "operator_id",
    paletteType = "monochrome",
    showInteractionsWhenComparing = true,
    showOtherOperatorsLegend = true,
    showNoDataHint = false,
  } = props;

  const formatCurrency = useFormatCurrency();

  // Determine if we should show interactions
  const hasNotSelectedAll = !compareWith.includes("sunshine.select-all");
  const showInteractions = showInteractionsWhenComparing
    ? hasNotSelectedAll
    : true;

  // Determine palette based on comparison selection
  const palette = compareWith.includes("sunshine.select-all")
    ? "monochrome"
    : paletteType;

  // Determine if we should show the "Other operators" legend item
  const shouldShowOtherOperatorsLegend = useMemo(() => {
    if (typeof showOtherOperatorsLegend === "function") {
      return showOtherOperatorsLegend(operatorsNames, compareWith);
    }
    if (typeof showOtherOperatorsLegend === "boolean") {
      return showOtherOperatorsLegend && compareWith.length > 0;
    }
    return compareWith.length > 0;
  }, [showOtherOperatorsLegend, operatorsNames, compareWith]);

  if (showNoDataHint && observations.length === 0) {
    return <NoDataHint />;
  }

  return (
    <LineChart
      data={observations}
      fields={{
        x: {
          componentIri: xField,
        },
        y: {
          componentIri: yField,
          ...(yAxisLabel && { axisLabel: yAxisLabel }),
        },
        segment: {
          componentIri: "operator_name",
          palette,
          colorMapping: {
            [operatorLabel]: chartPalette.categorical[0],
          },
        },
        style: {
          entity: entityField,
          colorDomain: [...operatorsNames] as string[],
          colorAcc: "operator_name",
        },
      }}
      measures={[{ iri: yField, label: "Rate", __typename: "Measure" }]}
      dimensions={[
        {
          iri: "operator_name",
          label: "Operator",
          __typename: "NominalDimension",
        },
      ]}
      aspectRatio={0.2}
    >
      {mini ? null : (
        <Box
          sx={{
            position: "relative",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            flexWrap: "wrap",
            minHeight: "20px",
            gap: 2,
          }}
          display="flex"
        >
          <LegendItem
            item={operatorLabel}
            color={chartPalette.categorical[0]}
            symbol={"line"}
          />

          {shouldShowOtherOperatorsLegend && (
            <LegendItem
              item={t({
                id: "progress-overtime-chart.legend-item.other-operators",
                message: "Other operators",
              })}
              color={themePalette.monochrome[200]}
              symbol={"line"}
            />
          )}
        </Box>
      )}

      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear format={formatCurrency} />
          <AxisTime />
          <Lines />
          {showInteractions && <InteractionHorizontal />}
        </ChartSvg>
        <Ruler />
        {showInteractions && <HoverDotMultiple />}
        {showInteractions && <Tooltip type={"multiple"} />}
      </ChartContainer>
    </LineChart>
  );
};
