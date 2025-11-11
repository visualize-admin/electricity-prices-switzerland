import { extent, scaleThreshold } from "d3";
import { first, last } from "lodash";

import { SunshineIndicator } from "src/domain/sunshine";
import { chartPalette } from "src/themes/palette";

const createThresholdsAroundMedian = (medianValue: number | undefined) => {
  const m = medianValue ?? 0;
  const domain = [m * 0.85, m * 0.95, m * 1.05, m * 1.15];
  return domain;
};

type IndicatorColorScaleSpec = {
  thresholds: (
    medianValue: number | undefined,
    values: number[],
    year: number
  ) => number[];
  palette: (thresholds: number[]) => string[];
};

const defaultColorScaleSpec: IndicatorColorScaleSpec = {
  thresholds: (medianValue, values) => {
    if (medianValue) {
      const m = medianValue;
      return createThresholdsAroundMedian(m);
    }
    return extent(values) as [number, number];
  },
  palette: () => chartPalette.diverging.GreenToOrange,
};

const yesNoPalette = [
  last(chartPalette.diverging.GreenToOrange),
  first(chartPalette.diverging.GreenToOrange),
] as string[];

export const colorScaleSpecs: Partial<
  Record<"energyPrices" | SunshineIndicator, IndicatorColorScaleSpec>
> & { default: IndicatorColorScaleSpec } = {
  default: defaultColorScaleSpec,
  outageInfo: {
    thresholds: () => [0.5],
    palette: () => yesNoPalette,
  },
  daysInAdvanceOutageNotification: {
    palette: (thresholds) =>
      defaultColorScaleSpec.palette(thresholds).slice().reverse(),
    thresholds: defaultColorScaleSpec.thresholds,
  },
  compliance: {
    thresholds: (_medianValue, _values, year) => [year > 2026 ? 60.01 : 75.01],
    palette: () => yesNoPalette.slice().reverse(),
  },
};

export const makeColorScale = (
  spec: IndicatorColorScaleSpec,
  medianValue: number | undefined,
  values: number[],
  year: number
) => {
  const thresholds = spec.thresholds(medianValue, values, year);
  const palette = spec.palette(thresholds);
  return scaleThreshold<number, string>().domain(thresholds).range(palette);
};
