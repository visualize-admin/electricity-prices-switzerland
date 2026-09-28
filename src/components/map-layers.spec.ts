import { scaleThreshold } from "d3";
import { describe, expect, it } from "vitest";

import { getFillColor, getStyles } from "src/components/map-helpers";
import { makeMunicipalityLayer } from "src/components/map-layers";

describe("makeMunicipalityLayer", () => {
  const colorScale = scaleThreshold<number, string>()
    .domain([20])
    .range(["#00ff00", "#ff0000"]);
  const layer = makeMunicipalityLayer({
    data: { type: "FeatureCollection", features: [] },
    layerId: "municipalities-base",
    mode: "base",
    valuesById: new Map([
      ["1", 10],
      ["2", 30],
      ["3", null],
    ]),
    colorScale,
  });
  const fillColor = (id: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (layer.props.getFillColor as any)({ id });
  const { fillColor: base } = getStyles().municipalities.base;

  it("colors a feature by its figure", () => {
    expect(fillColor("1")).toEqual(getFillColor(colorScale, 10, false));
    expect(fillColor("2")).toEqual(getFillColor(colorScale, 30, false));
  });

  it("shows a feature whose figure is null or missing as without data", () => {
    expect(fillColor("3")).toEqual(base.withoutData);
    expect(fillColor("4")).toEqual(base.withoutData);
  });
});
