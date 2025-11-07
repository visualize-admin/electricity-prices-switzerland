import { t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { useMemo } from "react";

import { ColorMapping } from "src/domain/color-mapping";
import { RP_PER_KM, RP_PER_KWH } from "src/domain/metrics";
import {
  isPeerGroupRow,
  type SunshineCostsAndTariffsData,
} from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";
import { chartPalette, palette } from "src/themes/palette";

import { AxisHeightCategories } from "./charts-generic/axis/axis-height-categories";
import { AxisWidthLinear } from "./charts-generic/axis/axis-width-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { DotPlot } from "./charts-generic/dot-plot/dot-plot-state";
import { Dots } from "./charts-generic/dot-plot/dots";
import { DotPlotMedian } from "./charts-generic/dot-plot/median";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import { LegendItem } from "./charts-generic/legends/color";
import { InteractionDotted } from "./charts-generic/overlay/interaction-dotted";
import { ProgressOvertimeChart } from "./charts-generic/progress-overtime-chart";
import { SectionProps } from "./detail-page/card";
import { TariffsTrendCardFilters } from "./tariffs-trend-card";

type TariffsTrendChartProps = {
  rootProps?: BoxProps;
  observations: SunshineCostsAndTariffsData["netTariffs"]["yearlyData"];
  netTariffs: Omit<SunshineCostsAndTariffsData["netTariffs"], "yearlyData">;
  operatorLabel: string;
  mini?: boolean;
  colorMapping?: ColorMapping;
} & Omit<SectionProps, "entity"> &
  TariffsTrendCardFilters;

export const TariffsTrendChart = (props: TariffsTrendChartProps) => {
  const { observations, viewBy, rootProps, colorMapping, ...restProps } = props;
  const operatorsNames = useMemo(() => {
    return new Set(observations.map((d) => d.operator_name));
  }, [observations]);

  return (
    <Box {...rootProps}>
      {viewBy === "latest" ? (
        <LatestYearChartView
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
const LatestYearChartView = (
  props: Omit<TariffsTrendChartProps, "viewBy"> & {
    operatorsNames: Set<string>;
  }
) => {
  const {
    observations,
    netTariffs,
    id,
    operatorLabel,
    compareWith,
    colorMapping,
  } = props;

  const mappedObservations = useMemo(() => {
    return observations
      .map((o) => ({
        ...o,
        category: getLocalizedLabel({
          id: `${o.category}-long`,
        }),
        year: o.period,
      }))
      .filter((x) => !isPeerGroupRow(x));
  }, [observations]);

  return (
    <DotPlot
      medianValue={netTariffs.peerGroupMedianRate ?? undefined}
      data={mappedObservations}
      fields={{
        x: { componentIri: "rate", axisLabel: RP_PER_KWH },
        y: { componentIri: "category" },
        segment: {
          componentIri: "operator_name",
          palette: "elcom",
        },
        style: {
          entity: "operator_id",
          colorMapping: colorMapping,
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
        <LegendItem
          item={t({
            id: "net-tariffs-trend-chart.legend-item.peer-group-median",
            message: "Peer Group Median",
          })}
          color={palette.monochrome[800]}
          symbol={"diamond"}
        />
        {compareWith?.includes("sunshine.select-all") && (
          <LegendItem
            item={t({
              id: "net-tariffs-trend-chart.legend-item.other-operators",
              message: "Other operators",
            })}
            color={palette.monochrome[200]}
            symbol={"circle"}
          />
        )}
      </Box>
      <ChartContainer>
        <ChartSvg>
          <AxisWidthLinear position="top" format="number" />
          <AxisHeightCategories stretch />
          <Dots compareWith={compareWith} />
          <InteractionDotted />
          <DotPlotMedian />
        </ChartSvg>
        <Tooltip type="multiple" forceYAnchor />
      </ChartContainer>
    </DotPlot>
  );
};
const ProgressOvertimeChartView = (
  props: Omit<TariffsTrendChartProps, "viewBy"> & {
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

  return (
    <ProgressOvertimeChart
      observations={observations}
      operatorLabel={operatorLabel}
      operatorsNames={operatorsNames}
      compareWith={compareWith}
      colorMapping={colorMapping}
      mini={mini}
      xField="period"
      yField="rate"
      yAxisLabel={RP_PER_KM}
      entityField="operator_id"
    />
  );
};
