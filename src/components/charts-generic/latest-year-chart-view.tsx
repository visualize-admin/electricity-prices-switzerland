import { t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { groupBy } from "lodash";
import { useMemo } from "react";
import React from "react";

import { DotRowLine } from "src/components/charts-generic/dot-plot/dot-row-line";
import PlotArea from "src/components/charts-generic/dot-plot/plot-area";
import { ColorMapping } from "src/domain/color-mapping";
import { ComponentFieldsFragment, GenericObservation } from "src/domain/data";
import { peerGroupOperatorName } from "src/domain/sunshine";
import { useIsMobile } from "src/lib/use-mobile";
import { chartPalette, palette } from "src/themes/palette";

import { AxisHeightCategories } from "./axis/axis-height-categories";
import { AxisWidthLinear } from "./axis/axis-width-linear";
import { ChartColorMapping, getChartColorMapping } from "./chart-color-mapping";
import { ChartContainer, ChartSvg } from "./containers";
import { DotPlot } from "./dot-plot/dot-plot-state";
import { Dots } from "./dot-plot/dots";
import { DotPlotMedian } from "./dot-plot/median";
import { Tooltip } from "./interaction/tooltip";
import { LegendItem } from "./legends/color";
import { InteractionDotted } from "./overlay/interaction-dotted";

type LatestYearChartViewProps<T extends GenericObservation> = {
  observations: T[];
  medianValue?: number;
  id: string;
  operatorLabel: string;
  compareWith?: string[];
  colorMapping?: ColorMapping;
  entityField: string;
  xField: {
    componentIri: string;
    axisLabel: string;
  };
  yField: {
    componentIri: string;
  };
  segmentField: {
    componentIri: string;
    palette: string;
  };
  tooltipField: {
    componentIri: string;
  };
  measures: ComponentFieldsFragment[];
  dimensions: ComponentFieldsFragment[];
  aspectRatio?: number;
  medianLegend: string;
  otherOperatorsLegend: string;
};

const ChartLegend: React.FC<{
  chartColorMappings: ChartColorMapping;
  compareWith: string[] | undefined;
  medianLegend: string;
  operatorLabel: string;
  otherOperatorsLegend: string;
}> = ({
  chartColorMappings,
  compareWith,
  medianLegend,
  operatorLabel,
  otherOperatorsLegend,
}) => (
  <Box
    display="flex"
    position="relative"
    justifyContent="flex-start"
    alignItems="flex-start"
    flexWrap="wrap"
    minHeight="20px"
    gap={1}
  >
    <LegendItem
      item={operatorLabel}
      color={chartPalette.categorical[0]}
      symbol={"circle"}
    />
    <LegendItem
      item={medianLegend}
      color={palette.monochrome[800]}
      symbol={"diamond"}
    />
    {chartColorMappings.map((item) => {
      if (
        item.label === peerGroupOperatorName ||
        item.label === operatorLabel
      ) {
        return null;
      }
      return (
        <LegendItem
          key={item.label}
          item={
            item.label === peerGroupOperatorName
              ? t({
                  id: "legend-item.peer-group-median",
                  message: "Peer Group Median",
                })
              : item.label
          }
          color={item.color}
          symbol={"circle"}
        />
      );
    })}

    {compareWith?.includes("sunshine.select-all") && (
      <LegendItem
        item={otherOperatorsLegend}
        color={palette.monochrome[200]}
        symbol={"circle"}
      />
    )}
  </Box>
);

export const LatestYearChartView = <T extends GenericObservation>(
  props: LatestYearChartViewProps<T>
) => {
  const {
    observations,
    medianValue,
    id,
    operatorLabel,
    compareWith,
    colorMapping,
    entityField,
    xField,
    yField,
    segmentField,
    tooltipField,
    measures,
    dimensions,
    aspectRatio = 0.15,
    medianLegend,
    otherOperatorsLegend,
  } = props;

  const isMobile = useIsMobile();

  // Create chart color mappings - either use provided colorMapping or build default
  const chartColorMappings = useMemo(() => {
    return getChartColorMapping({
      colorMapping,
      operatorLabel,
      observations,
      entityField,
    });
  }, [colorMapping, operatorLabel, observations, entityField]);

  // Group data by y-value for mobile view
  const { dataByYValue, yValuesSorted } = useMemo(() => {
    if (!isMobile) return { dataByYValue: {}, yValuesSorted: [] };
    const yFieldKey = yField.componentIri;
    const grouped = groupBy(observations, (d) => d[yFieldKey] as string);
    const sorted = [
      ...new Set(observations.map((d) => d[yFieldKey] as string)),
    ];
    return { dataByYValue: grouped, yValuesSorted: sorted };
  }, [isMobile, observations, yField.componentIri]);

  const dotAreaHeight = 60;
  const axisHeight = 20;
  const rowHeight = dotAreaHeight + axisHeight;

  return (
    <DotPlot
      medianValue={medianValue}
      data={observations}
      fields={{
        x: xField,
        y: yField,
        segment: segmentField,
        style: {
          entity: entityField,
          colorMapping: colorMapping,
          colorAcc: "operator_name",
          highlightValue: id,
        },
        tooltip: tooltipField,
      }}
      measures={measures}
      dimensions={dimensions}
      aspectRatio={aspectRatio}
      isMobile={isMobile}
    >
      <ChartLegend
        chartColorMappings={chartColorMappings}
        compareWith={compareWith}
        medianLegend={medianLegend}
        operatorLabel={operatorLabel}
        otherOperatorsLegend={otherOperatorsLegend}
      />
      {isMobile ? (
        <Box position="relative" mt={2}>
          {yValuesSorted.map((yValue) => (
            <Box position="relative" key={yValue}>
              <Box position="relative" top={-40}>
                <Tooltip type="multiple" forceYAnchor id={yValue} />
              </Box>

              <Typography variant="caption" sx={{ fontWeight: "bold", pl: 1 }}>
                {yValue}
              </Typography>
              <ChartSvg height={rowHeight} style={{ position: "static" }}>
                <AxisWidthLinear format="number" />
                <PlotArea>
                  <DotRowLine />
                  <Dots
                    data={dataByYValue[yValue]}
                    compareWith={compareWith}
                  />
                  <InteractionDotted id={yValue} data={dataByYValue[yValue]} />
                </PlotArea>
              </ChartSvg>
            </Box>
          ))}
        </Box>
      ) : (
        <ChartContainer>
          <ChartSvg>
            <AxisWidthLinear format="number" />
            <AxisHeightCategories />
            <PlotArea>
              <Dots compareWith={compareWith} />
              <InteractionDotted />
              <DotPlotMedian />
            </PlotArea>
          </ChartSvg>
          <Tooltip type="multiple" forceYAnchor />
        </ChartContainer>
      )}
    </DotPlot>
  );
};
