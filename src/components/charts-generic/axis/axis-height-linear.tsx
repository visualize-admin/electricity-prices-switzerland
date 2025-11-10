import { axisLeft, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import {
  AreasState,
  ColumnsState,
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";
import { useIsMobile } from "src/lib/use-mobile";

const TICK_MIN_HEIGHT = 50;

interface AxisTicksProps {
  format?: (d: number, i: number) => string;
  percentage?: boolean;
  leftMargin: number;
}

const AxisTicks = ({ format, percentage, leftMargin }: AxisTicksProps) => {
  const ref = useRef<SVGGElement>(null);

  const { yScale, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;

  const ticks = Math.max(Math.min(bounds.chartHeight / TICK_MIN_HEIGHT, 4), 2);
  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const tickValues = yScale.ticks(ticks);
    const yDomain = yScale.domain();

    if (
      Math.max(yDomain[0], yDomain[1]) >
      Math.max(tickValues[0], tickValues[tickValues.length - 1])
    ) {
      const diff =
        tickValues[1] > tickValues[0]
          ? tickValues[1] - tickValues[0]
          : tickValues[0] - tickValues[1];
      tickValues.push(tickValues[tickValues.length - 1] + diff);
    }

    const axis = axisLeft(yScale)
      .tickValues(tickValues)
      .tickSizeInner(-bounds.chartWidth)
      .tickSizeOuter(0)
      .tickFormat((d, i) =>
        percentage ? `${d}%` : format ? format(Number(d), i) : String(d)
      );
    g.call(axis);

    g.select(".domain").remove();

    g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", -6)
      .attr("dy", 3)
      .attr("text-anchor", "end");
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${leftMargin}, ${bounds.margins.top})`}
    />
  );
};

interface AxisLabelProps {
  yAxisLabel?: string;
}

const AxisLabel = ({ yAxisLabel }: AxisLabelProps) => {
  const isMobile = useIsMobile();
  const { bounds } = useChartState() as ColumnsState | LinesState | AreasState;
  const { axisLabelColor, labelFontSize } = useChartTheme();

  return (
    <g>
      <text
        x={0}
        y={isMobile ? bounds.margins.top / 2 - labelFontSize : 0}
        dy={bounds.margins.top / 2 - labelFontSize / 2}
        fontSize={labelFontSize}
        fill={axisLabelColor}
      >
        {/* TODO There should not be localisation here */}
        {yAxisLabel && getLocalizedLabel({ id: yAxisLabel as TranslationKey })}
      </text>
    </g>
  );
};

export const AxisHeightLinear = ({
  format,
  percentage,
}: {
  format?: (d: number, i: number) => string;
  percentage?: boolean;
}) => {
  const { yAxisLabel, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;

  return (
    <>
      <AxisLabel yAxisLabel={yAxisLabel} />
      <AxisTicks
        format={format}
        percentage={percentage}
        leftMargin={bounds.margins.left}
      />
    </>
  );
};
