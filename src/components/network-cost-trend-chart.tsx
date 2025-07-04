import { t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { useMemo } from "react";

import type {
  NetworkLevel,
  SunshineCostsAndTariffsData,
} from "src/domain/data";
import { getNetworkLevelMetrics } from "src/domain/metrics";
import { getLocalizedLabel } from "src/domain/translation";
import { chartPalette, palette } from "src/themes/palette";

import { AxisHeightCategories } from "./charts-generic/axis/axis-height-categories";
import { AxisHeightLinear } from "./charts-generic/axis/axis-height-linear";
import { AxisWidthLinear } from "./charts-generic/axis/axis-width-linear";
import { AxisTime } from "./charts-generic/axis/axis-width-time";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { HoverDotMultiple } from "./charts-generic/interaction/hover-dots-multiple";
import { Ruler } from "./charts-generic/interaction/ruler";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import { LegendItem } from "./charts-generic/legends/color";
import { Lines } from "./charts-generic/lines/lines";
import { LineChart } from "./charts-generic/lines/lines-state";
import { InteractionDotted } from "./charts-generic/overlay/interaction-dotted";
import { InteractionHorizontal } from "./charts-generic/overlay/interaction-horizontal";
import { Dots } from "./charts-generic/scatter-plot/dots";
import { ScatterPlotMedian } from "./charts-generic/scatter-plot/median";
import { ScatterPlot } from "./charts-generic/scatter-plot/scatter-plot-state";
import { SectionProps } from "./detail-page/card";
import { NetworkCostsTrendCardFilters } from "./network-costs-trend-card";

type NetworkCostTrendChartProps = {
  rootProps?: Omit<BoxProps, "children">;
  observations: SunshineCostsAndTariffsData["networkCosts"]["yearlyData"];
  networkCosts: Omit<SunshineCostsAndTariffsData["networkCosts"], "yearlyData">;
  operatorLabel: string;
  mini?: boolean;
} & Omit<SectionProps, "entity"> &
  NetworkCostsTrendCardFilters;

export const NetworkCostTrendChart = (props: NetworkCostTrendChartProps) => {
  const { observations, viewBy, rootProps, ...restProps } = props;
  const operatorsNames = useMemo(() => {
    return new Set(observations.map((d) => d.operator_name));
  }, [observations]);
  return (
    <Box {...rootProps}>
      {viewBy === "latest" ? (
        <LatestYearChartView
          observations={observations}
          operatorsNames={operatorsNames}
          {...restProps}
        />
      ) : (
        <ProgressOvertimeChartView
          observations={observations}
          operatorsNames={operatorsNames}
          {...restProps}
        />
      )}
    </Box>
  );
};

const LatestYearChartView = (
  props: Omit<NetworkCostTrendChartProps, "viewBy"> & {
    operatorsNames: Set<string>;
  }
) => {
  const { observations, networkCosts, id, operatorLabel, operatorsNames } =
    props;

  return (
    <ScatterPlot
      medianValue={networkCosts.peerGroupMedianRate ?? undefined}
      data={observations.map((o) => ({
        ...o,
        network_level: getLocalizedLabel({
          id: `network-level.${o.network_level}.long`,
        }),
      }))}
      fields={{
        x: {
          componentIri: "rate",
          axisLabel: getNetworkLevelMetrics(
            observations[0].network_level as NetworkLevel["id"]
          ),
        },
        y: { componentIri: "network_level" },
        segment: {
          componentIri: "operator_name",
          palette: "elcom",
        },
        style: {
          entity: "operator_id",
          colorDomain: [...operatorsNames] as string[],
          colorAcc: "operator_name",
          highlightValue: id,
        },
        tooltip: {
          componentIri: "year",
        },
      }}
      measures={[{ iri: "rate", label: "Rate", __typename: "Measure" }]}
      dimensions={[
        {
          iri: "operator_name",
          label: "Operator",
          __typename: "NominalDimension",
        },
      ]}
      aspectRatio={0.15}
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
          symbol={"circle"}
        />
        {/* <LegendItem
    item={t({
      id: "network-cost-trend-chart.legend-item.total-median",
      message: "Total Median",
    })}
    color={palette.monochrome[800]}
    symbol={"triangle"}
  /> */}
        <LegendItem
          item={t({
            id: "network-cost-trend-chart.legend-item.peer-group-median",
            message: "Peer Group Median",
          })}
          color={palette.monochrome[800]}
          symbol={"diamond"}
        />

        <LegendItem
          item={t({
            id: "network-cost-trend-chart.legend-item.other-operators",
            message: "Other operators",
          })}
          color={palette.monochrome[200]}
          symbol={"circle"}
        />
      </Box>
      <ChartContainer>
        <ChartSvg>
          <AxisWidthLinear position="top" format="number" />
          <AxisHeightCategories stretch />
          <Dots />
          <InteractionDotted />
          <ScatterPlotMedian />
        </ChartSvg>
        <Tooltip type="multiple" forceYAnchor />
      </ChartContainer>
    </ScatterPlot>
  );
};

const ProgressOvertimeChartView = (
  props: Omit<NetworkCostTrendChartProps, "viewBy"> & {
    operatorsNames: Set<string>;
  }
) => {
  const {
    observations,
    operatorLabel,
    operatorsNames,
    compareWith = [],
    mini,
  } = props;
  const hasNotSelectedAll = !compareWith.includes("sunshine.select-all");

  return (
    <LineChart
      data={observations}
      fields={{
        x: {
          componentIri: "year",
        },
        y: {
          componentIri: "rate",
          axisLabel: getNetworkLevelMetrics(
            observations[0].network_level as NetworkLevel["id"]
          ),
        },
        segment: {
          componentIri: "operator_name",
          palette: compareWith.includes("sunshine.select-all")
            ? "monochrome"
            : "elcom2",
          colorMapping: {
            [operatorLabel]: chartPalette.categorical[0],
          },
        },
        style: {
          entity: "operator_id",
          colorDomain: [...operatorsNames] as string[],
          colorAcc: `operator_name`,
        },
      }}
      measures={[{ iri: "rate", label: "Rate", __typename: "Measure" }]}
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

          {compareWith.length > 0 && (
            <LegendItem
              item={t({
                id: "network-cost-trend-chart.legend-item.other-operators",
                message: "Other operators",
              })}
              color={palette.monochrome[200]}
              symbol={"line"}
            />
          )}
        </Box>
      )}
      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear format="currency" />
          <AxisTime />
          <Lines />
          {hasNotSelectedAll && <InteractionHorizontal />}
        </ChartSvg>
        <Ruler />
        {hasNotSelectedAll && <HoverDotMultiple />}

        {hasNotSelectedAll && <Tooltip type={"multiple"} />}
      </ChartContainer>
    </LineChart>
  );
};
