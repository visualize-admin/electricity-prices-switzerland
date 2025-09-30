import { t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { max, mean } from "d3";
import { useMemo, useState } from "react";

import { MIN_PER_YEAR, PERCENT } from "src/domain/metrics";
import type { SunshinePowerStabilityData } from "src/domain/sunshine";
import { chartPalette, palette } from "src/themes/palette";

import {
  AnnotationX,
  AnnotationXLabel,
} from "./charts-generic/annotation/annotation-x";
import { AxisHeightCategories } from "./charts-generic/axis/axis-height-categories";
import { AxisWidthLinear } from "./charts-generic/axis/axis-width-linear";
import {
  BarsStacked,
  BarsStackedAxis,
} from "./charts-generic/bars/bars-stacked";
import { StackedBarsChart } from "./charts-generic/bars/bars-stacked-state";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { SortableLegendItem } from "./charts-generic/legends/color";
import { ProgressOvertimeChart } from "./charts-generic/progress-overtime-chart";
import { SectionProps } from "./detail-page/card";
import { PowerStabilityCardFilters } from "./power-stability-card";

type PowerStabilityChartProps = {
  observations:
    | SunshinePowerStabilityData["saifi"]["yearlyData"]
    | SunshinePowerStabilityData["saidi"]["yearlyData"];
  operatorLabel: string;
  mini?: boolean;
  rootProps?: Omit<BoxProps, "children">;
} & Omit<SectionProps, "entity"> &
  PowerStabilityCardFilters;

type PowerStabilityRow =
  SunshinePowerStabilityData["saidi"]["yearlyData"][0] & { planned: number };

export const PowerStabilityChart = (props: PowerStabilityChartProps) => {
  const { viewBy, observations, rootProps, ...restProps } = props;

  const dataWithStackFields = useMemo(() => {
    return observations.map((d) => ({
      ...d,
      planned: d.total,
      unplanned: d.unplanned,
    }));
  }, [observations]);

  return (
    <Box {...rootProps}>
      {viewBy === "latest" ? (
        <LatestYearChartView
          observations={dataWithStackFields}
          {...restProps}
        />
      ) : (
        <ProgressOvertimeChartView
          observations={dataWithStackFields}
          {...restProps}
        />
      )}
    </Box>
  );
};

//TODO: align with query-states
type PowerStabilitySortableType =
  | "planned"
  | "unplanned"
  | "total"
  | "operator";

const LatestYearChartView = (
  props: Omit<PowerStabilityChartProps, "viewBy" | "observations"> & {
    observations: PowerStabilityRow[];
  }
) => {
  const { observations, id, operatorLabel, overallOrRatio } = props;
  const [sortByItem, setSortByItem] =
    useState<PowerStabilitySortableType>("planned");

  const dataWithRatioApplied = useMemo(() => {
    return observations.map((d) => {
      const total = d.planned + d.unplanned;
      if (overallOrRatio === "ratio" && total > 0) {
        return {
          ...d,
          planned: (d.planned / total) * 100,
          unplanned: (d.unplanned / total) * 100,
          total,
        };
      }
      return {
        ...d,
        total,
      };
    });
  }, [observations, overallOrRatio]);

  const maxValue =
    max(dataWithRatioApplied, (d) => d.planned + d.unplanned) ?? 0;
  const xDomain: [number, number] =
    overallOrRatio === "ratio" ? [0, 100] : [0, maxValue];

  const sortedData = [...dataWithRatioApplied].sort((a, b) => {
    if (a.operator.toString() === id) return -1;
    if (b.operator.toString() === id) return 1;

    switch (sortByItem) {
      case "operator":
        return a.operator_name.localeCompare(b.operator_name);
      case "planned":
        return b.planned - a.planned;
      case "unplanned":
        return b.unplanned - a.unplanned;
      case "total":
        return b.planned + b.unplanned - (a.planned + a.unplanned);
      default:
        return 0;
    }
  });
  const average = useMemo(() => {
    return mean(sortedData.map((d) => d.total)) ?? 0;
  }, [sortedData]);

  const gridOperatorsLabel = t({
    id: "power-stability-trend-chart.legend-item.grid-operators",
    message: "Grid Operators",
  });

  return (
    <StackedBarsChart
      data={sortedData}
      fields={{
        x: {
          componentIri: ["planned", "unplanned"],
          axisLabel: overallOrRatio === "ratio" ? PERCENT : MIN_PER_YEAR,
        },
        domain: xDomain,
        y: {
          componentIri: "operator_name",
        },
        label: { componentIri: "avgLabel" },
        segment: {
          palette: "elcom",
          type: "stacked",
          componentIri: "unplanned",
        },
        annotation: [
          {
            avgLabel: t({
              id: "chart.avg.peer-group",
              message: "Average Peer Group",
            }),
            value: Math.round(average * 100) / 100,
          },
        ],
        style: {
          colorDomain: ["planned", "unplanned"],
          opacityDomain: ["2024"],
          colorAcc: "operator",
          opacityAcc: "year",
          highlightValue: id,
        },
      }}
      measures={[
        { iri: "planned", label: "Planned Minutes", __typename: "Measure" },
        {
          iri: "unplanned",
          label: "Unplanned Minutes",
          __typename: "Measure",
        },
      ]}
      dimensions={[
        {
          iri: "operator_name",
          label: "Operator",
          __typename: "NominalDimension",
        },
      ]}
    >
      <Box
        sx={{
          position: "relative",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexWrap: "wrap",
          minHeight: "20px",
          gap: 2,
          mb: 6,
        }}
        display="flex"
      >
        <SortableLegendItem<PowerStabilitySortableType>
          item={gridOperatorsLabel}
          color={palette.text.primary}
          value={"operator"}
          state={sortByItem}
          handleClick={setSortByItem}
        />

        <SortableLegendItem<PowerStabilitySortableType>
          item={t({
            id: "power-stability-trend-chart.sortable-legend-item.planned",
            message: "Planned",
          })}
          color={chartPalette.categorical[1]}
          value="planned"
          state={sortByItem}
          handleClick={setSortByItem}
        />

        <SortableLegendItem<PowerStabilitySortableType>
          item={t({
            id: "power-stability-trend-chart.sortable-legend-item.unplanned",
            message: "Unplanned",
          })}
          color={chartPalette.categorical[2]}
          value="unplanned"
          state={sortByItem}
          handleClick={setSortByItem}
        />
        {overallOrRatio !== "ratio" && (
          <SortableLegendItem<PowerStabilitySortableType>
            item={t({
              id: "power-stability-trend-chart.sortable-legend-item.total",
              message: "Total",
            })}
            color={palette.text.primary}
            value="total"
            state={sortByItem}
            handleClick={setSortByItem}
          />
        )}
      </Box>
      <ChartContainer>
        <ChartSvg>
          <AxisWidthLinear position="top" />
          <AxisHeightCategories
            stretch
            hideXAxis
            highlightedCategory={operatorLabel}
          />
          <BarsStacked />
          <BarsStackedAxis />
          {overallOrRatio !== "ratio" && <AnnotationX />}
        </ChartSvg>
        {overallOrRatio !== "ratio" && <AnnotationXLabel />}
      </ChartContainer>
    </StackedBarsChart>
  );
};

const ProgressOvertimeChartView = (
  props: Omit<PowerStabilityChartProps, "viewBy" | "observations"> & {
    observations: PowerStabilityRow[];
  }
) => {
  const {
    observations,
    operatorLabel,
    duration = "total",
    mini,
    compareWith = [],
  } = props;
  const operatorsNames = useMemo(() => {
    return new Set(observations.map((d) => d.operator_name));
  }, [observations]);

  return (
    <ProgressOvertimeChart
      observations={observations}
      operatorLabel={operatorLabel}
      operatorsNames={operatorsNames}
      compareWith={compareWith}
      mini={mini}
      xField="year"
      yField={duration}
      entityField="operator"
    />
  );
};
