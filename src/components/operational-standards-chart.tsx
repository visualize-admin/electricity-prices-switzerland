import { t } from "@lingui/macro";
import { Box } from "@mui/material";

import { AxisHeightLinear } from "src/components/charts-generic/axis/axis-height-linear";
import { AxisWidthHistogram } from "src/components/charts-generic/axis/axis-width-histogram";
import {
  ChartContainer,
  ChartSvg,
} from "src/components/charts-generic/containers";
import { HistogramColumns } from "src/components/charts-generic/histogram/histogram";
import { Histogram } from "src/components/charts-generic/histogram/histogram-state";
import type { SunshineOperationalStandardsData } from "src/domain/data";
import { DAYS, SWISS_FRANCS } from "src/domain/metrics";

import {
  AnnotationX,
  AnnotationXLabel,
} from "./charts-generic/annotation/annotation-x";
import { HistogramMedian } from "./charts-generic/histogram/median";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import { InteractionHistogram } from "./charts-generic/overlay/interaction-histogram";

//FIXME: replace with data.operatorsNotificationPeriodDays
const mockServiceQualityData = (selectedOperator: string) =>
  Array.from({ length: 30 }, (_, i) => ({
    id: i === 0 ? selectedOperator : Math.random() * 100,
    value: Math.round(Math.random() * 30),
    label: `Operator ${i + 1}`,
  }));

//FIXME: replace with data.operatorsFrancsPerInvoice
const mockComplianceData = (selectedOperator: string) =>
  Array.from({ length: 30 }, (_, i) => ({
    id: i === 0 ? selectedOperator : Math.random() * 100,
    value: Math.round(Math.random() * 100),
    label: `Operator ${i + 1}`,
  }));

export const ServiceQualityChart = ({
  data,
  id,
  operatorLabel,
}: {
  data: SunshineOperationalStandardsData["serviceQuality"];
  id: string;
  operatorLabel: string;
}) => {
  //FIXME: replace with data.operatorsNotificationPeriodDays
  const values = mockServiceQualityData(id)
    .map((d) => d.value)
    .sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median =
    values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  return (
    <Box sx={{ mt: 8 }}>
      <Histogram
        data={mockServiceQualityData(id)}
        medianValue={median}
        aspectRatio={0.3}
        groupedBy={5}
        xAxisLabel={DAYS}
        yAxisLabel={t({
          id: "sunshine.operational-standards.service-quality.share-of-operators",
          message: "Share of operators",
        })}
        xAxisUnit={DAYS}
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
                mockServiceQualityData(id).find((o) => o.id === id)?.value ?? 0,
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
      </Histogram>
    </Box>
  );
};

export const ComplianceChart = ({
  data,
  id,
  operatorLabel,
}: {
  data: SunshineOperationalStandardsData["compliance"];
  id: string;
  operatorLabel: string;
}) => {
  //FIXME: replace with data.operatorsFrancsPerInvoice
  const values = mockComplianceData(id)
    .map((d) => d.value)
    .sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median =
    values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  return (
    <Box sx={{ mt: 8 }}>
      <Histogram
        data={mockComplianceData(id)}
        medianValue={median}
        aspectRatio={0.3}
        groupedBy={25}
        xAxisLabel={SWISS_FRANCS}
        yAxisLabel={t({
          id: "sunshine.operational-standards.compliance.share-of-operators",
          message: "Share of operators",
        })}
        xAxisUnit={SWISS_FRANCS}
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
                mockComplianceData(id).find((o) => o.id === id)?.value ?? 0,
            },
          ],
        }}
        measures={[
          {
            iri: "value",
            label: "Compliance value",
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
      </Histogram>
    </Box>
  );
};
