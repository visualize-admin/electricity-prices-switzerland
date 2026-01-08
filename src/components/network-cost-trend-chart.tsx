import { t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { useMemo } from "react";

import { NoDataHint } from "src/components/hint";
import { ColorMapping } from "src/domain/color-mapping";
import { getNetworkLevelMetrics } from "src/domain/metrics";
import {
  isPeerGroupRow,
  type NetworkLevel,
  type SunshineCostsAndTariffsData,
} from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";

import { LatestYearDotsChartView } from "./charts-generic/latest-year-dots-chart-view";
import { ProgressOvertimeChart } from "./charts-generic/progress-overtime-chart";
import { SectionProps } from "./detail-page/card";
import { NetworkCostsTrendCardFilters } from "./network-costs-trend-card";

type NetworkCostTrendChartProps = {
  rootProps?: Omit<BoxProps, "children">;
  observations: SunshineCostsAndTariffsData["networkCosts"]["yearlyData"];
  networkCosts: Omit<SunshineCostsAndTariffsData["networkCosts"], "yearlyData">;
  operatorLabel: string;
  mini?: boolean;
  colorMapping?: ColorMapping;
} & Omit<SectionProps, "entity"> &
  NetworkCostsTrendCardFilters;

export const NetworkCostTrendChart = (props: NetworkCostTrendChartProps) => {
  const { observations, viewBy, rootProps, colorMapping, ...restProps } = props;
  const operatorsNames = useMemo(() => {
    return new Set(observations.map((d) => d.operator_name));
  }, [observations]);
  return (
    <Box {...rootProps}>
      {viewBy === "latest" ? (
        <NetworkCostLatestYearChartView
          observations={observations}
          operatorsNames={operatorsNames}
          colorMapping={colorMapping}
          {...restProps}
        />
      ) : (
        <ProgressOvertimeChartView
          observations={observations}
          operatorsNames={operatorsNames}
          colorMapping={colorMapping}
          {...restProps}
        />
      )}
    </Box>
  );
};

const NetworkCostLatestYearChartView = (
  props: Omit<NetworkCostTrendChartProps, "viewBy"> & {
    operatorsNames: Set<string>;
  }
) => {
  const {
    observations,
    networkCosts,
    id,
    operatorLabel,
    compareWith,
    colorMapping,
  } = props;

  const entityField = "operator_id";

  const mappedObservations = useMemo(() => {
    return observations
      .map((o) => ({
        ...o,
        network_level: getLocalizedLabel({
          id: `network-level.${o.network_level as NetworkLevel["id"]}.long`,
        }),
        year: o.year,
      }))
      .filter((x) => !isPeerGroupRow(x));
  }, [observations]);

  return (
    <LatestYearDotsChartView
      observations={mappedObservations}
      medianValue={networkCosts.peerGroupMedianRate ?? undefined}
      id={id}
      operatorLabel={operatorLabel}
      compareWith={compareWith}
      colorMapping={colorMapping}
      entityField={entityField}
      xField={{
        componentIri: "rate",
        axisLabel: getNetworkLevelMetrics(
          observations[0]?.network_level as NetworkLevel["id"]
        ),
      }}
      yField={{ componentIri: "network_level" }}
      segmentField={{
        componentIri: "operator_name",
        palette: compareWith?.includes("sunshine.select-all")
          ? "elcom-categorical-3" // Only green hover if all operators are selected
          : "elcom2", // Corresponding color palette for the tiles inside the selector if not all operators are selected
      }}
      tooltipField={{
        componentIri: "year",
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
      medianLegend={t({
        id: "legend-item.peer-group-median",
        message: "Peer Group Median",
      })}
      otherOperatorsLegend={t({
        id: "legend-item.other-operators",
        message: "Other operators",
      })}
    />
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
    colorMapping,
    mini,
  } = props;

  if (observations.length === 0) {
    return <NoDataHint />;
  }

  return (
    <ProgressOvertimeChart
      observations={observations}
      operatorLabel={operatorLabel}
      operatorsNames={operatorsNames}
      compareWith={compareWith}
      colorMapping={colorMapping}
      mini={mini}
      xField="year"
      yField="rate"
      yAxisLabel={getNetworkLevelMetrics(
        observations[0].network_level as NetworkLevel["id"]
      )}
      entityField="operator_id"
    />
  );
};
