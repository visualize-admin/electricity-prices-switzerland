import { t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { useMemo } from "react";

import { ColorMapping } from "src/domain/color-mapping";
import { ElectricityCategory } from "src/domain/data";
import { RP_PER_KM, RP_PER_KWH } from "src/domain/metrics";
import {
  isPeerGroupRow,
  type SunshineCostsAndTariffsData,
} from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";

import { LatestYearChartView as LatestYearChartViewGeneric } from "./charts-generic/latest-year-chart-view";
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
        <TariffsLatestYearChartView
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
const TariffsLatestYearChartView = (
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

  const entityField = "operator_id";

  const mappedObservations = useMemo(() => {
    return observations
      .map((o) => ({
        ...o,
        category: getLocalizedLabel({
          id: `${o.category as ElectricityCategory}-long`,
        }),
        year: o.period,
      }))
      .filter((x) => !isPeerGroupRow(x));
  }, [observations]);

  return (
    <LatestYearChartViewGeneric
      observations={mappedObservations}
      medianValue={netTariffs.peerGroupMedianRate ?? undefined}
      id={id}
      operatorLabel={operatorLabel}
      compareWith={compareWith}
      colorMapping={colorMapping}
      entityField={entityField}
      xField={{ componentIri: "rate", axisLabel: RP_PER_KWH }}
      yField={{ componentIri: "category" }}
      segmentField={{
        componentIri: "operator_name",
        palette: "elcom",
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
      yAxisLabel={RP_PER_KWH}
      entityField="operator_id"
    />
  );
};
