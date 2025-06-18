import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { useMemo } from "react";

import type { SunshineCostsAndTariffsData } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { chartPalette, palette } from "src/themes/palette";

import { AxisHeightCategories } from "./charts-generic/axis/axis-height-categories";
import { AxisWidthLinear } from "./charts-generic/axis/axis-width-linear";
import { ChartContainer, ChartSvg } from "./charts-generic/containers";
import { Tooltip } from "./charts-generic/interaction/tooltip";
import { LegendItem } from "./charts-generic/legends/color";
import { InteractionDotted } from "./charts-generic/overlay/interaction-dotted";
import { Dots } from "./charts-generic/scatter-plot/dots";
import { ScatterPlotMedian } from "./charts-generic/scatter-plot/median";
import { ScatterPlot } from "./charts-generic/scatter-plot/scatter-plot-state";
import { SectionProps } from "./detail-page/card";

type NetworkCostTrendChartProps = {
  observations: SunshineCostsAndTariffsData["networkCosts"]["yearlyData"];
  networkCosts: Omit<SunshineCostsAndTariffsData["networkCosts"], "yearlyData">;
  operatorLabel: string;
};

export const NetworkCostTrendChart = ({
  observations,
  networkCosts,
  id,
  operatorLabel,
}: NetworkCostTrendChartProps & Omit<SectionProps, "entity">) => {
  const operatorsNames = useMemo(() => {
    return new Set(observations.map((d) => d.operator_name));
  }, [observations]);
  return (
    <Box
      sx={{
        mt: 8,
      }}
    >
      <ScatterPlot
        medianValue={networkCosts.peerGroupMedianRate ?? undefined}
        data={observations.map((o) => ({
          ...o,
          network_level: getLocalizedLabel({
            id: `network-level.${o.network_level}.long`,
          }),
        }))}
        fields={{
          x: { componentIri: "rate" },
          y: { componentIri: "network_level" },
          segment: {
            componentIri: "operator_name",
            palette: "elcom",
          },
          style: {
            entity: "operator_id",
            colorDomain: [...operatorsNames] as string[],
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
          {/* <LegendItem
            item={t({
              id: "network-cost-trend-chart.legend-item.total-median",
              message: "Total Median",
            })}
            color={palette.monochrome[800]}
            symbol={"triangle"}
          /> */}
          <LegendItem
            item={t({
              id: "network-cost-trend-chart.legend-item.peer-group-median",
              message: "Peer Group Median",
            })}
            color={palette.monochrome[800]}
            symbol={"diamond"}
          />

          <LegendItem
            item={t({
              id: "network-cost-trend-chart.legend-item.other-operators",
              message: "Other operators",
            })}
            color={palette.monochrome[200]}
            symbol={"circle"}
          />
        </Box>
        <ChartContainer>
          <ChartSvg>
            <AxisWidthLinear position="top" hideXAxisTitle format="number" />
            <AxisHeightCategories stretch />
            <Dots />
            <InteractionDotted />
            <ScatterPlotMedian />
          </ChartSvg>
          <Tooltip type="multiple" forceYAnchor />
        </ChartContainer>
      </ScatterPlot>
    </Box>
  );
};
