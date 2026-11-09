import { useLingui } from "@lingui/react";
import { Box } from "@mui/material";
import { median as d3Median } from "d3";

import type { GenericObservation } from "src/domain/data";
import { RP_PER_KWH } from "src/domain/metrics";
import type { ObservationsQuery } from "src/graphql/queries";
import { data as distribution2026Charge } from "src/mocks/graphql/price-distribution-2026-h4-charge/Observations";
import { data as distribution2026Energy } from "src/mocks/graphql/price-distribution-2026-h4-energy/Observations";
import { data as distribution2026Gridusage } from "src/mocks/graphql/price-distribution-2026-h4-gridusage/Observations";
import { data as distribution2026Meteringrate } from "src/mocks/graphql/price-distribution-2026-h4-meteringrate/Observations";
import { data as distribution2026Total } from "src/mocks/graphql/price-distribution-2026-h4-total/Observations";
import { data as distribution2027Charge } from "src/mocks/graphql/price-distribution-2027-h4-charge/Observations";
import { data as distribution2027Energy } from "src/mocks/graphql/price-distribution-2027-h4-energy/Observations";
import { data as distribution2027Gridusage } from "src/mocks/graphql/price-distribution-2027-h4-gridusage/Observations";
import { data as distribution2027Meteringrate } from "src/mocks/graphql/price-distribution-2027-h4-meteringrate/Observations";
import { data as distribution2027Total } from "src/mocks/graphql/price-distribution-2027-h4-total/Observations";
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

import type { Meta, StoryObj } from "@storybook/react";

type RecordedDataset = {
  data: GenericObservation[];
  medianValue: number;
};

const toHistogramData = (query: ObservationsQuery): GenericObservation[] =>
  (query.observations ?? []).map((observation) => ({
    ...observation,
    muniOperator:
      observation.__typename === "OperatorObservation"
        ? `${observation.municipalityLabel}, ${observation.operatorLabel}`
        : String(
            (observation as { cantonLabel?: string }).cantonLabel ?? ""
          ),
  })) as GenericObservation[];

const recordedDataset = (query: ObservationsQuery): RecordedDataset => ({
  data: toHistogramData(query),
  medianValue: query.swissMedianObservations?.[0]?.value ?? 0,
});

const MOCK_DATASETS = {
  synthetic: {
    data: mockData as GenericObservation[],
    medianValue: 20,
  },
  "2026 charge": recordedDataset(distribution2026Charge),
  "2026 energy": recordedDataset(distribution2026Energy),
  "2026 grid usage": recordedDataset(distribution2026Gridusage),
  "2026 metering rate": recordedDataset(distribution2026Meteringrate),
  "2026 total": recordedDataset(distribution2026Total),
  "2027 charge": recordedDataset(distribution2027Charge),
  "2027 energy": recordedDataset(distribution2027Energy),
  "2027 grid usage": recordedDataset(distribution2027Gridusage),
  "2027 metering rate": recordedDataset(distribution2027Meteringrate),
  "2027 total": recordedDataset(distribution2027Total),
} satisfies Record<string, RecordedDataset>;

type DatasetName = keyof typeof MOCK_DATASETS;

type HistogramStoryArgs = { dataset: DatasetName };

const HistogramStory = ({ dataset }: HistogramStoryArgs) => {
  const { i18n } = useLingui();
  const { data, medianValue } = MOCK_DATASETS[dataset];

  return (
    <Box width="100%" maxWidth="800px" m={5}>
      <HistogramComponent
        data={data}
        medianValue={medianValue}
        aspectRatio={0.3}
        fields={{
          x: {
            componentIri: "value",
            axisLabel: "Price",
            axisUnit: i18n._(RP_PER_KWH),
          },
          y: {
            axisLabel: "Number of municipalities",
          },
          label: {
            componentIri: "muniOperator",
          },
          annotation: data.slice(0, 3) as Record<
            string,
            string | number | boolean
          >[],
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

const meta = {
  title: "Charts/Histogram",
  component: HistogramStory,
  argTypes: {
    dataset: {
      control: "select",
      options: Object.keys(MOCK_DATASETS) as DatasetName[],
    },
  },
  args: {
    dataset: "2026 total",
  },
} satisfies Meta<typeof HistogramStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Histogram: Story = {};

export const GroupedHistogram = () => {
  const operatorId =
    operationalStandards.serviceQuality.operatorsNotificationPeriodDays[0]
      .operatorId;
  const operatorLabel = `Operator ${operatorId}`;
  const median = d3Median(serviceQualityMock, (d: { days: number }) => d.days);
  return (
    <Box width="100%" maxWidth="800px" m={5} position="relative">
      <HistogramComponent
        data={serviceQualityMock}
        medianValue={median}
        aspectRatio={0.3}
        groupedBy={5}
        fields={{
          x: { componentIri: "days", axisLabel: "Days", axisUnit: "Days" },
          y: { axisLabel: "Share of operators", asPercentage: true },
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
