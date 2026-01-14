import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { sortBy } from "lodash";
import { useMemo } from "react";

import { getChartColorMapping } from "src/components/charts-generic/chart-color-mapping";
import { NoDataHint } from "src/components/hint";
import type { GenericObservation } from "src/domain/data";
import { useFormatCurrency } from "src/domain/helpers";
import { peerGroupOperatorName } from "src/domain/sunshine";
import { palette as themePalette } from "src/themes/palette";

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

interface ProgressOvertimeChartProps<
  T extends GenericObservation = GenericObservation
> {
  observations: T[];
  operatorLabel: string;
  operatorsNames: Set<string>;
  compareWith: string[];
  colorMapping?: Record<string, string>;
  mini?: boolean;
  // Field configuration
  xField: string;
  yField: string;
  yAxisLabel?: string;
  entityField?: string;
}

export const ProgressOvertimeChart = <T extends GenericObservation>(
  props: ProgressOvertimeChartProps<T>
) => {
  const {
    observations,
    operatorLabel,
    operatorsNames,
    compareWith = [],
    colorMapping,
    mini = false,
    xField,
    yField,
    yAxisLabel,
    entityField = "operator_id",
  } = props;

  const formatCurrency = useFormatCurrency();

  const hasNotSelectedAll = !compareWith.includes("sunshine.select-all");
  const showInteractions = hasNotSelectedAll;

  // Use passed colorMapping if available, otherwise fall back to default palette selection
  const palette = colorMapping
    ? undefined
    : compareWith.includes("sunshine.select-all")
    ? "monochrome"
    : "elcom2";

  const shouldShowOtherOperatorsLegend = compareWith.includes(
    "sunshine.select-all"
  );

  const sortedObservations = useMemo(() => {
    return sortBy(observations, [
      (d) => (d.operator_name === operatorLabel ? 1 : 0),
    ]).filter((d) => d[entityField] !== operatorLabel);
  }, [observations, entityField, operatorLabel]);

  // Create chart color mappings - either use provided colorMapping or build default
  const chartColorMappings = useMemo(() => {
    return getChartColorMapping({
      colorMapping,
      operatorLabel,
      observations,
      entityField,
    });
  }, [colorMapping, operatorLabel, observations, entityField]);

  if (observations.length === 0) {
    return <NoDataHint />;
  }

  return (
    <LineChart
      data={sortedObservations}
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
          palette: palette || "elcom2",
          colorMapping: Object.fromEntries(
            chartColorMappings.map((item) => [item.label, item.color])
          ),
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
          display="flex"
          position="relative"
          justifyContent="flex-start"
          alignItems="flex-start"
          flexWrap="wrap"
          minHeight="20px"
          gap={2}
        >
          {chartColorMappings.map((item) => (
            <LegendItem
              key={item.label}
              item={
                item.label === peerGroupOperatorName
                  ? t({
                      id: "legend-item.peer-group-median",
                      message: "Peer Group Median",
                    })
                  : item.label
              }
              color={item.color}
              symbol={
                item.label === peerGroupOperatorName ? "dash-dot-line" : "line"
              }
            />
          ))}
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
          <Lines medianGroup={peerGroupOperatorName} />
          {showInteractions && <InteractionHorizontal />}
        </ChartSvg>
        <Ruler />
        {showInteractions && <HoverDotMultiple />}
        {showInteractions && <Tooltip type={"multiple"} />}
      </ChartContainer>
    </LineChart>
  );
};
