import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { median as d3Median } from "d3";
import { useMemo } from "react";

import { AxisHeightLinear } from "src/components/charts-generic/axis/axis-height-linear";
import { AxisWidthHistogram } from "src/components/charts-generic/axis/axis-width-histogram";
import {
  ChartContainer,
  ChartSvg,
} from "src/components/charts-generic/containers";
import { HistogramColumns } from "src/components/charts-generic/histogram/histogram";
import { Histogram } from "src/components/charts-generic/histogram/histogram-state";
import { DAYS, SWISS_FRANCS } from "src/domain/metrics";
import type { SunshineOperationalStandardsData } from "src/domain/sunshine";
import complianceMock from "src/mocks/sunshine-operationalStandards-compliance-mock.json";
import serviceQualityMock from "src/mocks/sunshine-operationalStandards-serviceQuality-mock.json";
import { useFlag } from "src/utils/flags";
import { NonNullableProp } from "src/utils/non-nullable-prop";

import {
  AnnotationX,
  AnnotationXLabel,
} from "./charts-generic/annotation/annotation-x";
import { HistogramMedian } from "./charts-generic/histogram/median";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import { InteractionHistogram } from "./charts-generic/overlay/interaction-histogram";

export const ServiceQualityChart = ({
  data,
  id,
  operatorLabel,
}: {
  data: SunshineOperationalStandardsData["serviceQuality"];
  id: string;
  operatorLabel: string;
}) => {
  const mock = useFlag("mockOperationalStandardsChart");

  const chartData = useMemo(() => {
    const chartData = mock
      ? serviceQualityMock
      : data.operatorsNotificationPeriodDays;
    return chartData.filter(
      (d): d is NonNullableProp<typeof d, "days"> => d.days != null
    );
  }, [data.operatorsNotificationPeriodDays, mock]);
  const median = d3Median(chartData, (d) => d.days);

  return (
    <Box position="relative">
      <Histogram
        data={chartData}
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
          x: { componentIri: "days" },
          label: { componentIri: "label" },
          style: {
            palette: "elcom-categorical-2",
          },
          annotation: [
            {
              label: operatorLabel,
              days: chartData.find((o) => o.operatorId === id)?.days ?? 0,
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
  const mock = useFlag("mockOperationalStandardsChart");
  const chartData = useMemo(() => {
    const chartData = mock ? complianceMock : data.operatorsFrancsPerInvoice;
    return chartData.filter(
      (d): d is NonNullableProp<typeof d, "francsPerInvoice"> =>
        d.francsPerInvoice != null
    );
  }, [data.operatorsFrancsPerInvoice, mock]);

  const median = d3Median(chartData, (d) => d.francsPerInvoice);
  return (
    <Box position="relative">
      <Histogram
        data={chartData}
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
          x: { componentIri: "francsPerInvoice" },
          label: { componentIri: "label" },
          style: {
            palette: "elcom-categorical-2",
          },
          annotation: [
            {
              label: operatorLabel,
              francsPerInvoice:
                chartData.find((o) => o.operatorId === id)?.francsPerInvoice ??
                0,
            },
          ],
        }}
        measures={[
          {
            iri: "francsPerInvoice",
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
