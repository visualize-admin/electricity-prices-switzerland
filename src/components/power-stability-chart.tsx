import { t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { max, pointer } from "d3";
import { useMemo, useRef, useState } from "react";
import React from "react";

import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import {
  StackedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { ColorMapping } from "src/domain/color-mapping";
import { MIN_PER_YEAR, PERCENT } from "src/domain/metrics";
import {
  peerGroupOperatorName,
  type SunshinePowerStabilityData,
} from "src/domain/sunshine";
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
  colorMapping?: ColorMapping;
  rootProps?: Omit<BoxProps, "children">;
} & Omit<SectionProps, "entity"> &
  PowerStabilityCardFilters;

type PowerStabilityRow =
  SunshinePowerStabilityData["saidi"]["yearlyData"][0] & { planned: number };

export const PowerStabilityChart = (props: PowerStabilityChartProps) => {
  const { viewBy, observations, rootProps, colorMapping, ...restProps } = props;

  const dataWithStackFields = useMemo(() => {
    return observations.map((d) => ({
      ...d,
      total: d.total,
      planned: d.total - d.unplanned,
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
          colorMapping={colorMapping}
          {...restProps}
        />
      )}
    </Box>
  );
};

const InteractionStackedBars = React.memo(() => {
  const [, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);

  const { data, bounds, yScale, getCategory } =
    useChartState() as StackedBarsState;

  const { chartWidth, chartHeight, margins } = bounds;

  const findDatum = (e: React.MouseEvent) => {
    const [x, y] = pointer(e, ref.current!);

    const step = yScale.step();
    const index = Math.round(y / step);
    const category = yScale.domain()[index];

    if (category) {
      const found = data.find((d) => category === getCategory(d));
      dispatch({
        type: "INTERACTION_UPDATE",
        value: {
          interaction: {
            visible: true,
            mouse: { x, y: yScale(category) ?? 0 },
            d: found,
          },
        },
      });
    }
  };
  const hideTooltip = () => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  };

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      <rect
        fillOpacity={0}
        width={chartWidth}
        height={chartHeight}
        onMouseOut={hideTooltip}
        onMouseOver={findDatum}
        onMouseMove={findDatum}
      />
    </g>
  );
});

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

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSortByItem = (item: PowerStabilitySortableType) => {
    if (sortByItem === item) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortByItem(item);
      setSortDirection("asc");
    }
  };

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
    if (a.operator_id.toString() === id) return -1;
    if (b.operator_id.toString() === id) return 1;

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

  if (sortDirection === "asc") {
    sortedData.reverse();
  }

  // Move current operator to the top
  const currentOperatorIndex = sortedData.findIndex(
    (d) => d.operator_id.toString() === id
  );
  if (currentOperatorIndex > -1) {
    const [currentOperator] = sortedData.splice(currentOperatorIndex, 1);
    sortedData.unshift(currentOperator);
  }

  const gridOperatorsLabel = t({
    id: "power-stability-trend-chart.legend-item.grid-operators",
    message: "Grid Operators",
  });

  const sortedDataWithoutMedian = sortedData.filter(
    (d) => d.operator_name !== peerGroupOperatorName
  );
  const medianPeerGroupObservation = sortedData.find(
    (d) => d.operator_name === peerGroupOperatorName
  );

  return (
    <StackedBarsChart
      data={sortedDataWithoutMedian}
      fields={{
        x: {
          componentIri: ["planned", "unplanned"],
          axisLabel: overallOrRatio === "ratio" ? PERCENT : MIN_PER_YEAR,
        },
        domain: xDomain,
        annotation: medianPeerGroupObservation
          ? [
              {
                value: medianPeerGroupObservation.total,
                avgLabel: t({
                  id: "legend-item.total-peer-group-median",
                  message: "Total (Peer Group Median)",
                }),
              },
            ]
          : [],
        y: {
          componentIri: "operator_name",
        },
        label: { componentIri: "avgLabel" },
        segment: {
          palette: "elcom",
          type: "stacked",
          componentIri: "unplanned",
        },
        style: {
          colorDomain: ["planned", "unplanned"],
          opacityDomain: [],
          colorAcc: "operator",
          opacityAcc: "year",
          highlightValue: id,
        },
      }}
      measures={[
        {
          iri: "planned",
          label: t({
            id: "power-stability-trend-chart.sortable-legend-item.planned",
            message: "Planned",
          }),
          __typename: "Measure",
        },
        {
          iri: "unplanned",
          label: t({
            id: "power-stability-trend-chart.sortable-legend-item.unplanned",
            message: "Unplanned",
          }),
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
          gap: 4,
          mb: 6,
        }}
        display="flex"
      >
        <SortableLegendItem<PowerStabilitySortableType>
          item={gridOperatorsLabel}
          color={palette.text.primary}
          value={"operator"}
          active={sortByItem === "operator"}
          direction={sortDirection}
          handleClick={handleSortByItem}
        />

        <SortableLegendItem<PowerStabilitySortableType>
          item={t({
            id: "power-stability-trend-chart.sortable-legend-item.planned",
            message: "Planned",
          })}
          color={chartPalette.categorical[1]}
          value="planned"
          active={sortByItem === "planned"}
          direction={sortDirection}
          handleClick={handleSortByItem}
        />

        <SortableLegendItem<PowerStabilitySortableType>
          item={t({
            id: "power-stability-trend-chart.sortable-legend-item.unplanned",
            message: "Unplanned",
          })}
          color={chartPalette.categorical[2]}
          value="unplanned"
          active={sortByItem === "unplanned"}
          direction={sortDirection}
          handleClick={handleSortByItem}
        />
        {overallOrRatio !== "ratio" && (
          <SortableLegendItem<PowerStabilitySortableType>
            item={t({
              id: "power-stability-trend-chart.sortable-legend-item.total",
              message: "Total",
            })}
            color={palette.text.primary}
            value="total"
            active={sortByItem === "total"}
            direction={sortDirection}
            handleClick={handleSortByItem}
          />
        )}
      </Box>
      <ChartContainer>
        <ChartSvg>
          <AxisWidthLinear />
          <AxisHeightCategories hideXAxis highlightedCategory={operatorLabel} />
          <BarsStacked />
          <BarsStackedAxis />
          {overallOrRatio !== "ratio" && <AnnotationX />}
          <InteractionStackedBars />
        </ChartSvg>
        {overallOrRatio !== "ratio" && <AnnotationXLabel />}
        <Tooltip type="multiple" />
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
    saidiSaifiType = "total",
    mini,
    compareWith = [],
    colorMapping,
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
      colorMapping={colorMapping}
      mini={mini}
      xField="year"
      yField={saidiSaifiType}
      entityField="operator_id"
    />
  );
};
