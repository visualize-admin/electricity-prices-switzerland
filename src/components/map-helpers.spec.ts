import { BBox as GeoJsonBBox } from "geojson";
import { describe, test, expect } from "vitest";

import { getZoomedViewState } from "src/components/map-helpers";
import assert from "src/lib/assert";

describe("getZoomedViewState", () => {
  test("should return zoomed view state for given bbox", () => {
    const currentViewState = {
      latitude: 46.8182,
      longitude: 8.2275,
      zoom: 2,
      bearing: 0,
      pitch: 0,
      width: 200,
      height: 200,
      maxZoom: 16,
      minZoom: 2,
    };

    const bbox: GeoJsonBBox = [
      5.956800664952974, 45.81912371940225, 10.493446773955753,
      47.80741209797084,
    ];

    const result = getZoomedViewState(currentViewState, bbox, {});

    assert(result !== undefined, "assert should be defined");
    expect(result.latitude).toBeTypeOf("number");
    expect(result.longitude).toBeTypeOf("number");
    expect(result.zoom).toBeTypeOf("number");
    expect(result.zoom).toBeGreaterThan(currentViewState.zoom);
  });

  test("should respect zoom constraints", () => {
    const currentViewState = {
      latitude: 46.8182,
      longitude: 8.2275,
      zoom: 15,
      bearing: 0,
      pitch: 0,
      width: 200,
      height: 200,
      maxZoom: 16,
      minZoom: 2,
    };

    const bbox: GeoJsonBBox = [
      5.956800664952974, 45.81912371940225, 10.493446773955753,
      47.80741209797084,
    ];

    const result = getZoomedViewState(currentViewState, bbox, {});
    assert(result !== undefined, "assert should be defined");
    expect(result.zoom).toBeLessThanOrEqual(currentViewState.maxZoom);
    expect(result.zoom).toBeGreaterThanOrEqual(currentViewState.minZoom);
  });
});
