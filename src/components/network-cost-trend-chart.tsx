import { Box } from "@mui/material";
import { useMemo } from "react";

import type { GenericObservation, ObservationValue } from "src/domain/data";

import { AxisHeightCategories } from "./charts-generic/axis/axis-height-categories";
import { AxisWidthLinear } from "./charts-generic/axis/axis-width-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import { InteractionDotted } from "./charts-generic/overlay/interaction-dotted";
import { Dots } from "./charts-generic/scatter-plot/dots";
import { ScatterPlot } from "./charts-generic/scatter-plot/scatter-plot-state";
import { SectionProps } from "./detail-page/card";

type NetworkCostTrendChartProps = {
  observations: GenericObservation[];
};

type CategoryKey =
  | "SunNetworkCostsNE5"
  | "SunNetworkCostsNE6"
  | "SunNetworkCostsNE7";

type TransformedDatum = {
  category: string;
  value: number;
  SunName: string;
  operatorLabel: ObservationValue;
  operator: ObservationValue;
  uniqueId: ObservationValue;
  municipalityLabel: ObservationValue;
  period: ObservationValue;
};

const TARGET_OPERATORS = [
  "Elektrizitätswerk der Stadt Zürich",
  "BKW Energie AG",
];

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  {
    key: "SunNetworkCostsNE5",
    label: "Medium Voltage Distribution (Level 5) - CHF./kVA",
  },
];

export const NetworkCostTrendChart = ({
  observations,
  id,
}: NetworkCostTrendChartProps & Omit<SectionProps, "entity">) => {
  const transformedData: TransformedDatum[] = useMemo(() => {
    return CATEGORIES.flatMap(({ key, label }) => {
      const entries: TransformedDatum[] = [];

      const all = observations
        .map((obs) => obs[key])
        .filter((v): v is number => !isNaN(v as number));
      const median =
        all.length > 0
          ? all.sort((a, b) => a - b)[Math.floor(all.length / 2)]
          : undefined;

      if (median !== undefined) {
        entries.push({
          category: label,
          value: median,
          SunName: label,
          operatorLabel: "Median Total",
          operator: "median",
          uniqueId: `median-${key}`,
          municipalityLabel: "Median Total",
          period: "2024",
        });
      }

      for (const obs of observations) {
        const value = obs[key];
        if (typeof value === "number" && !isNaN(value)) {
          entries.push({
            category: label,
            value,
            SunName: label,
            operatorLabel: obs.SunName,
            operator: obs.SunPartnerId,
            uniqueId: `${obs.SunName}-${key}`,
            municipalityLabel: obs.SunName,
            period: obs.SunPeriod,
          });
        }
      }

      return entries;
    });
  }, [observations]);

  return (
    <Box>
      <ScatterPlot
        data={transformedData.slice(0, 20)}
        operatorsId={id}
        fields={{
          x: { componentIri: "value" },
          y: { componentIri: "SunName" },
          segment: {
            componentIri: "operatorLabel",
            palette: "elcom",
          },
          style: {
            entity: "operator",
            colorDomain: [
              ...new Set(transformedData.map((d) => d.operatorLabel)),
            ] as string[],
            colorAcc: "operatorLabel",
          },
        }}
        measures={[{ iri: "value", label: "Value", __typename: "Measure" }]}
        dimensions={[
          { iri: "SunName", label: "Category", __typename: "NominalDimension" },
        ]}
        aspectRatio={0.3}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisWidthLinear position="top" hideXAxisTitle format="number" />
            <AxisHeightCategories stretch />
            <Dots />
            <InteractionDotted />
          </ChartSvg>
          <Tooltip type="multiple" forceYAnchor />
        </ChartContainer>
      </ScatterPlot>
    </Box>
  );
};
