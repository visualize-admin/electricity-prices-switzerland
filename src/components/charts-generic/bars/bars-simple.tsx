import * as React from "react";

export const Bar = React.memo(
  ({
    x,
    y,
    width,
    height,
    color,
    fillOpacity = 1,
    stroke,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    fillOpacity?: number;
    stroke?: string;
  }) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={stroke}
      />
    );
  }
);
