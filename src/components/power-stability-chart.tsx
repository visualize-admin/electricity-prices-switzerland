import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { max } from "d3";
import { sortBy } from "lodash";
import { useMemo, useState } from "react";

import type { SunshinePowerStabilityData } from "src/domain/data";
import { getTextWidth } from "src/domain/helpers";
import { chartPalette, palette } from "src/themes/palette";

import { AxisHeightCategories } from "./charts-generic/axis/axis-height-categories";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { AxisWidthLinear } from "./charts-generic/axis/axis-width-linear";
import { AxisTime } from "./charts-generic/axis/axis-width-time";
import {
  BarsStacked,
  BarsStackedAxis,
} from "./charts-generic/bars/bars-stacked";
import { StackedBarsChart } from "./charts-generic/bars/bars-stacked-state";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { HoverDotMultiple } from "./charts-generic/interaction/hover-dots-multiple";
import { Ruler } from "./charts-generic/interaction/ruler";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import {
  ARROW_WIDTH,
  LegendItem,
  SORTABLE_EXTERNAL_GAP,
  SORTABLE_INTERNAL_GAP,
  SortableLegendItem,
} from "./charts-generic/legends/color";
import { Lines } from "./charts-generic/lines/lines";
import { LineChart } from "./charts-generic/lines/lines-state";
import { InteractionHorizontal } from "./charts-generic/overlay/interaction-horizontal";
import { SectionProps } from "./detail-page/card";
import {
  DurationFilter,
  OverallOrRatioFilter,
  ViewByFilter,
} from "./power-stability-card";

type PowerStabilityFilters = {
  view: ViewByFilter;
  overallOrRatio: OverallOrRatioFilter;
  duration: DurationFilter;
};

type PowerStabilityChartProps = {
  observations:
    | SunshinePowerStabilityData["saifi"]["yearlyData"]
    | SunshinePowerStabilityData["saidi"]["yearlyData"];
  operatorLabel: string;
} & Omit<SectionProps, "entity"> &
  PowerStabilityFilters;

type PowerStabilityRow =
  SunshinePowerStabilityData["saidi"]["yearlyData"][0] & { planned: number };

export const PowerStabilityChart = (props: PowerStabilityChartProps) => {
  const { view, observations, ...restProps } = props;

  const dataWithStackFields = useMemo(() => {
    return observations.map((d) => ({
      ...d,
      planned: d.total,
      unplanned: d.unplanned,
    }));
  }, [observations]);

  return (
    <Box sx={{ mt: 8 }}>
      {view === "latest" ? (
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

type PowerStabilitySortableType = "planned" | "unplanned" | "total";

const LatestYearChartView = (
  props: Omit<PowerStabilityChartProps, "view" | "observations"> & {
    observations: PowerStabilityRow[];
  }
) => {
  const { observations, id, operatorLabel, overallOrRatio } = props;
  const [sortByItem, setSortByItem] =
    useState<PowerStabilitySortableType>("planned");

  const dataWithRatioApplied = useMemo(() => {
    if (overallOrRatio === "ratio") {
      return observations.map((d) => {
        return {
          ...d,
          planned: (d.planned / d.total) * 100,
          unplanned: (d.unplanned / d.total) * 100,
        };
      });
    }
    return observations;
  }, [observations, overallOrRatio]);

  const maxValue =
    max(dataWithRatioApplied, (d) => d.planned + d.unplanned) ?? 0;
  const xDomain: [number, number] =
    overallOrRatio === "ratio" ? [0, 100] : [0, maxValue];

  const sortedData = sortBy(dataWithRatioApplied, [
    (x) => x.operator.toString() !== id,
    (x) => {
      if (sortByItem === "planned") return -x.planned;
      if (sortByItem === "unplanned") return -x.unplanned;
      return -(x.planned + x.unplanned);
    },
  ]);
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
        },
        domain: xDomain,
        y: {
          componentIri: "operator_name",
          sorting: { sortingType: "byTotalSize", sortingOrder: "desc" },
        },
        label: { componentIri: "operator_name" },
        segment: {
          palette: "elcom",
          type: "stacked",
          componentIri: "unplanned",
        },
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
          mb: 2,
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
            state=""
            value=""
            handleClick={() => {}}
          />
        </Box>

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
        </ChartSvg>
      </ChartContainer>
    </StackedBarsChart>
  );
};

const ProgressOvertimeChartView = (
  props: Omit<PowerStabilityChartProps, "view" | "observations"> & {
    observations: PowerStabilityRow[];
  }
) => {
  const { observations, operatorLabel, duration } = props;
  const operatorsNames = useMemo(() => {
    return new Set(observations.map((d) => d.operator_name));
  }, [observations]);

  // FIXME: Currently not tested as there is only data for 2024
  return (
    <LineChart
      data={observations}
      fields={{
        x: {
          componentIri: "year",
        },
        y: {
          componentIri: duration,
        },
        segment: {
          componentIri: "operator_name",
          palette: "monochrome",
          colorMapping: {
            [operatorLabel]: chartPalette.categorical[0],
          },
        },
        style: {
          entity: "operator",
          colorDomain: [...operatorsNames] as string[],
          colorAcc: `operator_name`,
        },
      }}
      measures={[{ iri: "total", label: "Total", __typename: "Measure" }]}
      dimensions={[
        {
          iri: "operator_name",
          label: "Operator",
          __typename: "NominalDimension",
        },
      ]}
      aspectRatio={0.2}
    >
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
        {/* <LegendItem
    item={t({
      id: "network-cost-trend-chart.legend-item.total-median",
      message: "Total Median",
    })}
    color={palette.monochrome[800]}
    symbol={"triangle"}
  /> */}
        {/* <LegendItem
          item={t({
            id: "network-cost-trend-chart.legend-item.peer-group-median",
            message: "Peer Group Median",
          })}
          color={palette.monochrome[800]}
          symbol={"line"}
        /> */}

        <LegendItem
          item={t({
            id: "network-cost-trend-chart.legend-item.other-operators",
            message: "Other operators",
          })}
          color={palette.monochrome[200]}
          symbol={"line"}
        />
      </Box>
      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear format="currency" /> <AxisTime />
          <Lines />
          <InteractionHorizontal />
        </ChartSvg>
        <Ruler />
        <HoverDotMultiple />

        <Tooltip type={"multiple"} />
      </ChartContainer>
    </LineChart>
  );
};
