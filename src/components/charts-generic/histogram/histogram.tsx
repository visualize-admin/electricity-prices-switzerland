import { useTheme } from "@mui/material";
import { scaleBand } from "d3";
import * as React from "react";

import { Column } from "src/components/charts-generic/columns/columns-simple";
import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { GenericObservation } from "src/domain/data";

export const HistogramColumns = () => {
  const { bounds, xScale, yScale, bins, colors, binMeta } =
    useChartState() as HistogramState;
  const theme = useTheme();
  const { margins, chartWidth } = bounds;

  if (binMeta) {
    const bandDomain = binMeta.map((b, i) => b.label ?? String(i));
    const bandScale = scaleBand<string>()
      .domain(bandDomain)
      .range([0, chartWidth]);

    const getBarColor = (
      meta: (typeof binMeta)[number],
      d: GenericObservation[]
    ) => {
      if (meta.isNoData) return "transparent";
      if (d.length > 0)
        return colors
          ? colors((meta.x0 + meta.x1) / 2)
          : theme.palette.primary.main;
      return "transparent";
    };

    return (
      <g transform={`translate(${margins.left} ${margins.top})`}>
        {bins.map((d, i) => {
          const meta = binMeta[i];
          if (!meta) return null;
          const label = meta.label ?? String(i);
          const x = bandScale(label) ?? 0;
          const width = bandScale.bandwidth();
          const y = meta.isNoData ? yScale(0) : yScale(d.length);
          const height = meta.isNoData
            ? 0
            : Math.abs(yScale(d.length) - yScale(0));
          return (
            <Column
              key={i}
              x={x}
              width={width}
              y={y}
              height={height}
              color={getBarColor(meta, d)}
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
