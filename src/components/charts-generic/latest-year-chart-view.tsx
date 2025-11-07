import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { useMemo } from "react";

import { ColorMapping } from "src/domain/color-mapping";
import { ComponentFieldsFragment, GenericObservation } from "src/domain/data";
import { peerGroupOperatorName } from "src/domain/sunshine";
import { chartPalette, palette } from "src/themes/palette";

import { AxisHeightCategories } from "./axis/axis-height-categories";
import { AxisWidthLinear } from "./axis/axis-width-linear";
import { getChartColorMapping } from "./chart-color-mapping";
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

  // Create chart color mappings - either use provided colorMapping or build default
  const chartColorMappings = useMemo(() => {
    return getChartColorMapping({
      colorMapping,
      operatorLabel,
      observations,
      entityField,
    });
  }, [colorMapping, operatorLabel, observations, entityField]);

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
      <ChartContainer>
        <ChartSvg>
          <AxisWidthLinear position="top" format="number" />
          <AxisHeightCategories stretch />
          <Dots compareWith={compareWith} />
          <InteractionDotted />
          <DotPlotMedian />
        </ChartSvg>
        <Tooltip type="multiple" forceYAnchor />
      </ChartContainer>
    </DotPlot>
  );
};
