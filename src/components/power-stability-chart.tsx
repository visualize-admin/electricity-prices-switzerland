import { Box } from "@mui/material";
import { max } from "d3";

import type { SunshinePowerStabilityData } from "src/domain/data";

import { AxisHeightCategories } from "./charts-generic/axis/axis-height-categories";
import { AxisWidthLinear } from "./charts-generic/axis/axis-width-linear";
import {
  BarsStacked,
  BarsStackedAxis,
} from "./charts-generic/bars/bars-stacked";
import { StackedBarsChart } from "./charts-generic/bars/bars-stacked-state";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { SectionProps } from "./detail-page/card";

type PowerStabilityChartProps = {
  observations:
    | SunshinePowerStabilityData["saifi"]
    | SunshinePowerStabilityData["saidi"];
  operatorLabel: string;
};

export const PowerStabilityChart = ({
  observations,
  id,
  operatorLabel,
}: PowerStabilityChartProps & Omit<SectionProps, "entity">) => {
  const dataWithStackFields = observations.yearlyData.map((d) => ({
    ...d,
    planned: d.total,
    unplanned: d.unplanned,
  }));

  const maxValue =
    max(dataWithStackFields, (d) => d.planned + d.unplanned) ?? 0;
  const xDomain: [number, number] = [0, maxValue];

  const sortedData = [
    ...dataWithStackFields.filter((d) => d.operator.toString() === id),
    ...dataWithStackFields.filter((d) => d.operator.toString() !== id),
  ];

  return (
    <Box sx={{ mt: 8 }}>
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
    </Box>
  );
};
