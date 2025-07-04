import { Box } from "@mui/material";
import operationalStandards from "mocks/sunshine-operationalStandards-426.json";

import { RP_PER_KWH } from "src/domain/metrics";

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

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof HistogramComponent> = {
  title: "Charts/Histogram",
  component: HistogramComponent,
};

export default meta;
type Story = StoryObj<typeof HistogramComponent>;

export const Histogram: Story = {
  render: () => {
    const medianValue = 20; // Set the median to 20

    // Create some annotations for specific values
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
  },
};

export const GroupedHistogram: Story = {
  render: () => {
    // Use operatorId from the imported JSON for annotation
    const operatorId =
      operationalStandards.serviceQuality.operatorsNotificationPeriodDays[0]
        .operatorId;
    const operatorLabel = `Operator ${operatorId}`;
    // Create mock grouped data (like operational-standards-chart.tsx)
    const mockGroupedData = Array.from({ length: 30 }, (_, i) => ({
      id: i === 0 ? operatorId : Math.random() * 100,
      value: Math.round(Math.random() * 30),
      label: `Operator ${i + 1}`,
    }));
    const values = mockGroupedData.map((d) => d.value).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    const median =
      values.length % 2 !== 0
        ? values[mid]
        : (values[mid - 1] + values[mid]) / 2;
    return (
      <Box
        sx={{ width: "100%", maxWidth: "800px", m: 5, position: "relative" }}
      >
        <HistogramComponent
          data={mockGroupedData}
          medianValue={median}
          aspectRatio={0.3}
          groupedBy={5}
          xAxisLabel="Days"
          yAxisLabel="Share of operators"
          xAxisUnit="Days"
          yAsPercentage
          fields={{
            x: { componentIri: "value" },
            label: { componentIri: "label" },
            style: {
              palette: "elcom-categorical-2",
            },
            annotation: [
              {
                label: operatorLabel,
                value:
                  mockGroupedData.find((o) => o.id === operatorId)?.value ?? 0,
              },
            ],
          }}
          measures={[
            {
              iri: "value",
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
  },
};
