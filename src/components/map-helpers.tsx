import { ScaleThreshold, color } from "d3";

export const getFillColor = (
  colorScale: ScaleThreshold<number, string, never> | undefined,
  v: number | undefined,
  highlighted: boolean
): [number, number, number] => {
  if (v === undefined) {
    return [0, 0, 0];
  }
  const c = colorScale && colorScale(v);
  const rgb =
    c &&
    color(c)
      ?.darker(highlighted ? 1 : 0)
      ?.rgb();
  return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
};
