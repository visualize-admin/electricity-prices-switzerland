import { Box } from "@mui/material";
import { Axis } from "@visx/axis";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleBand, scaleOrdinal } from "@visx/scale";
import { Bar } from "@visx/shape";
import { defaultStyles, TooltipWithBounds, useTooltip } from "@visx/tooltip";
import * as d3 from "d3";
import React from "react";

import { ComparisonData, ReleaseMetrics } from "src/admin-auth/metrics-types";

export type MetricsChartPalette = {
  background: string;
  cacheHit: string;
  cacheMiss: string;
};

type ChartProps = {
  comparisonData: ComparisonData[];
  releases: ReleaseMetrics[];
  palette: MetricsChartPalette;
};

type BarData = {
  operation: string;
  release: {
    release: string;
    cacheHit: number;
    cacheMiss: number;
    total: number;
    hitRate: number;
  };
  depIndex: number;
  yOffset: number;
};

type InnerChartProps = ChartProps & {
  width: number;
};

const GraphQLMetricsChartInner: React.FC<InnerChartProps> = ({
  comparisonData,
  releases,
  width,
  palette,
}) => {
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } =
    useTooltip<BarData>();

  if (comparisonData.length === 0 || releases.length === 0) {
    return null;
  }

  // Chart configuration
  const margin = { top: 20, right: 150, bottom: 20, left: 200 };
  const chartWidth = width - margin.left - margin.right;
  const numDeployments = releases.length;
  const itemHeight = 16;
  const chartHeight =
    comparisonData.length * (itemHeight * numDeployments) -
    margin.top -
    margin.bottom;

  // Scales
  const maxTotal = Math.max(
    ...comparisonData.flatMap((d) => d.releases.map((dep) => dep.total))
  );

  const xScale = scaleLinear({
    domain: [0, maxTotal],
    range: [0, chartWidth],
  });

  const yScale = scaleBand({
    domain: comparisonData.map((d) => d.operation),
    range: [0, chartHeight],
    paddingInner: 0.1,
  });

  const releaseColor = scaleOrdinal({
    domain: releases.map((d) => d.release),
    range: [...d3.schemeCategory10],
  });

  const groupHeight = yScale.bandwidth();
  const barHeight = groupHeight / numDeployments;

  // Flatten data for rendering
  const barData: BarData[] = comparisonData.flatMap((opData) =>
    opData.releases.map((depData, depIndex) => ({
      operation: opData.operation,
      release: depData,
      depIndex,
      yOffset: (yScale(opData.operation) || 0) + depIndex * barHeight,
    }))
  );

  const handleMouseOver = (
    event: React.MouseEvent<SVGRectElement>,
    data: BarData
  ) => {
    const coords = localPoint(event) || { x: 0, y: 0 };
    showTooltip({
      tooltipData: data,
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={chartHeight + margin.top + margin.bottom}>
        <Group top={margin.top} left={margin.left}>
          {/* Bars */}
          {barData.map((bar, i) => (
            <Group key={`bar-group-${i}`} top={bar.yOffset}>
              {/* Cache hit bar (green) */}
              <Bar
                x={0}
                y={0}
                width={chartWidth}
                height={barHeight - 2}
                fill={releaseColor(bar.release.release) as string}
                opacity={0.2}
              />

              <Bar
                x={0}
                y={0}
                width={xScale(bar.release.cacheHit)}
                height={barHeight - 2}
                fill={palette.cacheHit}
                opacity={1}
              />
              {/* Cache miss bar (red) */}
              <Bar
                x={xScale(bar.release.cacheHit)}
                y={0}
                width={xScale(bar.release.cacheMiss)}
                height={barHeight - 2}
                fill={palette.cacheMiss}
                opacity={1}
              />
              {/* hover */}
              <Bar
                x={0}
                y={0}
                width={chartWidth}
                height={barHeight}
                fill="transparent"
                onMouseMove={(e) => handleMouseOver(e, bar)}
                onMouseLeave={hideTooltip}
              />

              {/* Deployment label */}
              <text
                x={chartWidth + 10}
                y={barHeight / 2}
                dy="0.35em"
                fontSize="10px"
                fill={releaseColor(bar.release.release) as string}
              >
                {bar.release.release}
              </text>
            </Group>
          ))}

          {/* X-axis */}
          <Axis
            orientation="bottom"
            scale={xScale}
            top={chartHeight}
            numTicks={10}
            stroke="gray"
            tickStroke="gray"
            tickFormat={(value) => `${value}`}
            label="Number of Requests"
            labelProps={{
              fontSize: 12,
              fill: "#333",
              textAnchor: "middle",
              dy: 30,
            }}
          />

          {/* Y-axis */}
          <Axis
            orientation="left"
            scale={yScale}
            stroke="gray"
            tickStroke="gray"
            tickValues={yScale.domain()}
            tickLabelProps={() => ({
              fontSize: 10,
              textAnchor: "end",
              dy: "0.33em",
            })}
          />
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        // @ts-expect-error - visx tooltip type compatibility
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            borderRadius: "4px",
            padding: "12px",
          }}
        >
          <div style={{ marginBottom: "4px", fontWeight: "bold" }}>
            {tooltipData.release.release}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span>Operation:</span>
            <strong>{tooltipData.operation}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span>
              <span
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: palette.cacheHit,
                  display: "inline-block",
                  marginRight: 6,
                }}
              ></span>
              Cache Hit:
            </span>
            <strong>{tooltipData.release.cacheHit}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span>
              <span
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: palette.cacheMiss,
                  display: "inline-block",
                  marginRight: 6,
                }}
              ></span>
              Cache Miss:
            </span>
            <strong>{tooltipData.release.cacheMiss}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span>Hit Rate:</span>
            <strong>{(tooltipData.release.hitRate * 100).toFixed(1)}%</strong>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

const GraphQLMetricsChart: React.FC<ChartProps> = ({
  comparisonData,
  releases,
  palette,
}) => {
  return (
    <Box sx={{ my: 3, overflowX: "auto" }}>
      <ParentSize>
        {({ width }) => (
          <GraphQLMetricsChartInner
            comparisonData={comparisonData}
            releases={releases}
            width={width}
            palette={palette}
          />
        )}
      </ParentSize>
    </Box>
  );
};

export default GraphQLMetricsChart;
