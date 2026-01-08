import { t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { pointer } from "d3";
import { useMemo, useRef } from "react";
import React from "react";

import {
  StackedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { PowerStabilityHorizontalStackedBars } from "src/components/power-stability-horizontal-stacked-bars";
import { ColorMapping } from "src/domain/color-mapping";
import { type SunshinePowerStabilityData } from "src/domain/sunshine";
import { chartPalette, palette } from "src/themes/palette";

import { SortableLegendItem } from "./charts-generic/legends/color";
import { ProgressOvertimeChart } from "./charts-generic/progress-overtime-chart";
import { SectionProps } from "./detail-page/card";
import { PowerStabilityCardFilters } from "./power-stability-card";

export type PowerStabilityChartProps = {
  observations:
    | SunshinePowerStabilityData["saifi"]["yearlyData"]
    | SunshinePowerStabilityData["saidi"]["yearlyData"];
  operatorLabel: string;
  mini?: boolean;
  colorMapping?: ColorMapping;
  rootProps?: Omit<BoxProps, "children">;
} & Omit<SectionProps, "entity"> &
  PowerStabilityCardFilters;

export type PowerStabilityRow =
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
        <PowerStabilityHorizontalStackedBars
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

export const InteractionStackedBars = React.memo(
  ({
    data: dataProp,
    id,
    debug = false,
  }: {
    data?: StackedBarsState["data"];
    id?: string;
    debug?: boolean;
  }) => {
    const [, dispatch] = useInteraction();
    const ref = useRef<SVGGElement>(null);

    const {
      data: dataContext,
      bounds,
      yScale,
      getCategory,
      getCategoryFromYValue,
    } = useChartState() as StackedBarsState;

    const data = dataProp ?? dataContext;
    const { chartWidth, chartHeight } = bounds;

    const findDatum = (e: React.MouseEvent) => {
      const [x, y] = pointer(e, ref.current!);

      const category = getCategoryFromYValue(y, data);

      if (category) {
        const found = data.find((d) => category === getCategory(d));
        dispatch({
          type: "INTERACTION_UPDATE",
          value: {
            interaction: {
              visible: true,
              mouse: { x, y: yScale(category) ?? 0 },
              d: found,
              id,
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
      <g ref={ref}>
        <rect
          fill={debug ? "hotpink" : "transparent"}
          fillOpacity={debug ? 0.3 : 0}
          stroke={debug ? "hotpink" : "none"}
          width={chartWidth}
          height={chartHeight}
          onMouseOut={hideTooltip}
          onMouseOver={findDatum}
          onMouseMove={findDatum}
        />
      </g>
    );
  }
);

//TODO: align with query-states
export type PowerStabilitySortableType =
  | "planned"
  | "unplanned"
  | "total"
  | "operator";

export const SortOptions = ({
  sortByItem,
  sortDirection,
  handleSortByItem,
  overallOrRatio,
}: {
  sortByItem: PowerStabilitySortableType;
  sortDirection: "asc" | "desc";
  handleSortByItem: (item: PowerStabilitySortableType) => void;
  overallOrRatio: "overall" | "ratio" | undefined;
}) => {
  const gridOperatorsLabel = t({
    id: "power-stability-trend-chart.legend-item.grid-operators",
    message: "Grid Operators",
  });
  return (
    <Box
      display="flex"
      position="relative"
      justifyContent="flex-start"
      alignItems="flex-start"
      flexWrap="wrap"
      minHeight="20px"
      gap={4}
      mb={6}
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
