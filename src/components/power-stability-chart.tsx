import { t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { max, mean } from "d3";
import { sortBy } from "lodash";
import { useMemo, useState } from "react";

import { getTextWidth } from "src/domain/helpers";
import { MIN_PER_YEAR } from "src/domain/metrics";
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
import {
  ARROW_WIDTH,
  SORTABLE_EXTERNAL_GAP,
  SORTABLE_INTERNAL_GAP,
  SortableLegendItem,
} from "./charts-generic/legends/color";
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

type SortState = {
  attribute: PowerStabilitySortableType;
  direction: "asc" | "desc";
};

const LatestYearChartView = (
  props: Omit<PowerStabilityChartProps, "viewBy" | "observations"> & {
    observations: PowerStabilityRow[];
  }
) => {
  const { observations, id, operatorLabel, overallOrRatio } = props;
  const [sortState, setSortState] = useState<SortState>({
    attribute: "planned",
    direction: "desc",
  });

  const handleSortClick = (attribute: PowerStabilitySortableType) => {
    setSortState((prevState) => {
      if (prevState.attribute === attribute) {
        // Same attribute clicked, toggle direction
        return {
          attribute,
          direction: prevState.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Different attribute clicked, use default direction based on attribute
        const defaultDirection = attribute === "operator" ? "asc" : "desc";
        return {
          attribute,
          direction: defaultDirection,
        };
      }
    });
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

  const sortedData = useMemo(() => {
    const sorted = sortBy(dataWithRatioApplied, (item) => {
      let sortValue: number | string;
      switch (sortState.attribute) {
        case "operator":
          sortValue = item.operator_name;
          break;
        case "planned":
          sortValue = item.planned;
          break;
        case "unplanned":
          sortValue = item.unplanned;
          break;
        case "total":
          sortValue = item.planned + item.unplanned;
          break;
        default:
          sortValue = 0;
      }

      return sortValue;
    });

    if (sortState.direction === "desc") {
      sorted.reverse();
    }

    // Ensure the target operator is always on top
    const targetIndex = sorted.findIndex(
      (item) => item.operator.toString() === id
    );
    if (targetIndex > 0) {
      const [targetItem] = sorted.splice(targetIndex, 1);
      sorted.unshift(targetItem);
    }

    return sorted;
  }, [dataWithRatioApplied, sortState, id]);

  const average = useMemo(() => {
    return mean(sortedData.map((d) => d.total)) ?? 0;
  }, [sortedData]);

  const maxYLabelWidth = Math.max(
    ...sortedData.map((label) =>
      getTextWidth(label.operator_name, { fontSize: 12, fontWeight: "bold" })
    )
  );

  const gridOperatorsLabel = t({
    id: "power-stability-trend-chart.legend-item.grid-operators",
    message: "Grid Operators",
  });

  const gridOperatorsLabelWidth = getTextWidth(gridOperatorsLabel, {
    fontSize: 12,
    fontWeight: "bold",
  });

  const SORTABLE_GRID_ITEM_WIDTH =
    gridOperatorsLabelWidth +
    ARROW_WIDTH +
    SORTABLE_EXTERNAL_GAP +
    SORTABLE_INTERNAL_GAP;

  return (
    <StackedBarsChart
      data={sortedData}
      fields={{
        x: {
          componentIri: ["planned", "unplanned"],
          axisLabel: MIN_PER_YEAR,
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
        <Box
          sx={{
            mr: `${maxYLabelWidth - SORTABLE_GRID_ITEM_WIDTH}px`,
          }}
        >
          <SortableLegendItem
            item={gridOperatorsLabel}
            color={palette.text.primary}
            value={"operator"}
            selected={sortState.attribute === "operator"}
            direction={sortState.direction}
            handleClick={handleSortClick}
          />
        </Box>

        <SortableLegendItem<PowerStabilitySortableType>
          item={t({
            id: "power-stability-trend-chart.sortable-legend-item.planned",
            message: "Planned",
          })}
          color={chartPalette.categorical[1]}
          value="planned"
          selected={sortState.attribute === "planned"}
          direction={sortState.direction}
          handleClick={handleSortClick}
        />

        <SortableLegendItem<PowerStabilitySortableType>
          item={t({
            id: "power-stability-trend-chart.sortable-legend-item.unplanned",
            message: "Unplanned",
          })}
          color={chartPalette.categorical[2]}
          value="unplanned"
          selected={sortState.attribute === "unplanned"}
          direction={sortState.direction}
          handleClick={handleSortClick}
        />
        <SortableLegendItem<PowerStabilitySortableType>
          item={t({
            id: "power-stability-trend-chart.sortable-legend-item.total",
            message: "Total",
          })}
          color={palette.text.primary}
          value="total"
          selected={sortState.attribute === "total"}
          direction={sortState.direction}
          handleClick={handleSortClick}
        />
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
          <AnnotationX />
        </ChartSvg>
        <AnnotationXLabel />
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

  // FIXME: Currently not tested as there is only data for 2024
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
      paletteType="monochrome"
    />
  );
};
