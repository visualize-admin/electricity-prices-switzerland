import { Box } from "@mui/material";
import { median as d3Median } from "d3";

import { RP_PER_KWH } from "src/domain/metrics";
import operationalStandards from "src/mocks/sunshine-operationalStandards-426.json";
import serviceQualityMock from "src/mocks/sunshine-operationalStandards-serviceQuality-mock.json";

import { AnnotationX, AnnotationXLabel } from "../annotation/annotation-x";
import { AxisHeightLinear } from "../axis/axis-height-linear";
import {
  AxisWidthHistogram,
  AxisWidthHistogramDomain,
} from "../axis/axis-width-histogram";
import { ChartContainer, ChartSvg } from "../containers";
import { Tooltip } from "../interaction/tooltip";
import { InteractionHistogram } from "../overlay/interaction-histogram";

import { HistogramColumns } from "./histogram";
import { HistogramMinMaxValues } from "./histogram-min-max-values";
import { Histogram as HistogramComponent } from "./histogram-state";
import { HistogramMedian } from "./median";
import { mockData } from "./mock";

import type { Meta } from "@storybook/react";

const meta: Meta<typeof HistogramComponent> = {
  title: "Charts/Histogram",
  component: HistogramComponent,
};

export default meta;

export const Histogram = () => {
  const medianValue = 20;
  const annotations = [mockData[0], mockData[1], mockData[2]];

  return (
    <Box sx={{ width: "100%", maxWidth: "800px", m: 5 }}>
      <HistogramComponent
        data={mockData}
        medianValue={medianValue}
        aspectRatio={0.3}
        xAxisLabel="Price"
        yAxisLabel="Number of municipalities"
        xAxisUnit={RP_PER_KWH}
        fields={{
          x: {
            componentIri: "value",
          },
          label: {
            componentIri: "muniOperator",
          },
          annotation: annotations,
        }}
        measures={[
          {
            iri: "value",
            label: "Price value",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <HistogramMinMaxValues />
            <AnnotationX />
            <HistogramColumns />
            <HistogramMedian label="CH Median" />
            <AxisWidthHistogramDomain />
            <InteractionHistogram />
          </ChartSvg>
          <Tooltip type="single" />
          <AnnotationXLabel />
        </ChartContainer>
      </HistogramComponent>
    </Box>
  );
};

export const GroupedHistogram = () => {
  const operatorId =
    operationalStandards.serviceQuality.operatorsNotificationPeriodDays[0]
      .operatorId;
  const operatorLabel = `Operator ${operatorId}`;
  const median = d3Median(serviceQualityMock, (d: { days: number }) => d.days);
  return (
    <Box sx={{ width: "100%", maxWidth: "800px", m: 5, position: "relative" }}>
      <HistogramComponent
        data={serviceQualityMock}
        medianValue={median}
        aspectRatio={0.3}
        groupedBy={5}
        xAxisLabel="Days"
        yAxisLabel="Share of operators"
        xAxisUnit="Days"
        yAsPercentage
        fields={{
          x: { componentIri: "days" },
          label: { componentIri: "label" },
          style: {
            palette: "elcom-categorical-2",
          },
          annotation: [
            {
              label: operatorLabel,
              days:
                serviceQualityMock.find(
                  (o: { operatorId: string }) => o.operatorId === operatorId
                )?.days ?? 0,
            },
          ],
        }}
        measures={[
          {
            iri: "days",
            label: "Notification period (days)",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear percentage />
            <HistogramColumns />
            <AnnotationX />
            <HistogramMedian label="CH Median" />
            <AxisWidthHistogram />
            <InteractionHistogram />
          </ChartSvg>
          <AnnotationXLabel />
        </ChartContainer>
        <Tooltip type="single" />
      </HistogramComponent>
    </Box>
  );
};
