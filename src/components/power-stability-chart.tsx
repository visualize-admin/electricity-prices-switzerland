import { Box } from "@mui/material";
import { max } from "d3";
import { sortBy } from "lodash";
import { useMemo } from "react";

import type { SunshinePowerStabilityData } from "src/domain/data";
import { chartPalette } from "src/themes/palette";

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
import { Lines } from "./charts-generic/lines/lines";
import { LineChart } from "./charts-generic/lines/lines-state";
import { InteractionHorizontal } from "./charts-generic/overlay/interaction-horizontal";
import { SectionProps } from "./detail-page/card";
import { OverallOrRatioFilter, ViewByFilter } from "./power-stability-card";

type PowerStabilityFilters = {
  view: ViewByFilter;
  overallOrRatio: OverallOrRatioFilter;
};

type PowerStabilityChartProps = {
  observations:
    | SunshinePowerStabilityData["saifi"]["yearlyData"]
    | SunshinePowerStabilityData["saidi"]["yearlyData"];
  operatorLabel: string;
} & Omit<SectionProps, "entity"> &
  PowerStabilityFilters;

export const PowerStabilityChart = (props: PowerStabilityChartProps) => {
  const { view, ...restProps } = props;
  return (
    <Box sx={{ mt: 8 }}>
      {view === "latest" ? (
        <LatestYearChartView {...restProps} />
      ) : (
        <ProgressOvertimeChartView {...restProps} />
      )}
    </Box>
  );
};

const LatestYearChartView = (props: Omit<PowerStabilityChartProps, "view">) => {
  const { observations, id, operatorLabel } = props;
  const dataWithStackFields = observations.map((d) => ({
    ...d,
    planned: d.total,
    unplanned: d.unplanned,
  }));

  const maxValue =
    max(dataWithStackFields, (d) => d.planned + d.unplanned) ?? 0;
  const xDomain: [number, number] = [0, maxValue];

  const sortedData = sortBy(dataWithStackFields, (x) => {
    return x.operator.toString() === id ? 0 : 1;
  });

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
      //FIXME: we need a better solution for this since having less bars increases the spacing between them
      aspectRatio={0.8}
    >
      <ChartContainer>
        <ChartSvg>
          <AxisWidthLinear position="top" hideXAxisTitle />
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
  props: Omit<PowerStabilityChartProps, "view">
) => {
  const { observations, operatorLabel } = props;
  const operatorsNames = useMemo(() => {
    return new Set(observations.map((d) => d.operator_name));
  }, [observations]);
  return (
    <LineChart
      data={observations}
      fields={{
        x: {
          componentIri: "year",
        },
        y: {
          componentIri: "total",
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
