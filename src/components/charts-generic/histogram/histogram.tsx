import { useTheme } from "@mui/material";
import * as React from "react";

import { Column } from "src/components/charts-generic/columns/columns-simple";
import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

import { getBarColor } from "./histogram-state";

export const HistogramColumns = () => {
  const {
    bounds,
    xScale,
    yScale,
    bins,
    colors,
    binMeta,
    fields,
    yAsPercentage,
    totalCount,
    bandScale,
  } = useChartState() as HistogramState;
  const theme = useTheme();
  const { margins } = bounds;

  if (binMeta && bandScale) {
    return (
      <g transform={`translate(${margins.left} ${margins.top})`}>
        {bins.map((d, i) => {
          const meta = binMeta[i];
          if (!meta) return null;
          const label = meta.label ?? String(i);
          const x = bandScale(label) ?? 0;
          const width = bandScale.bandwidth();
          const barValue =
            yAsPercentage && totalCount
              ? (d.length / totalCount) * 100
              : d.length;
          const y = yScale(barValue);
          const height = Math.abs(yScale(barValue) - yScale(0));
          return (
            <Column
              key={i}
              x={x}
              width={width}
              y={y}
              height={height}
              color={getBarColor({
                bin: d,
                meta,
                fields,
                colors,
                theme,
                binIndex: i,
              })}
            />
          );
        })}
      </g>
    );
  }

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {bins.map((d, i) => (
        <React.Fragment key={i}>
          {d.x0 !== undefined && d.x1 !== undefined && (
            <Column
              x={xScale(d.x0) + 1}
              width={Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)}
              y={yScale(d.length)}
              height={Math.abs(yScale(d.length) - yScale(0))}
              color={
                !colors
                  ? theme.palette.primary.main
                  : colors(d.x0 + (d.x1 - d.x0) / 2)
              }
            />
          )}
        </React.Fragment>
      ))}
    </g>
  );
};
