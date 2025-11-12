import { extent, scaleThreshold } from "d3";
import { first, last } from "lodash";

import { SunshineIndicator } from "src/domain/sunshine";
import { chartPalette } from "src/themes/palette";

type ThresholdCoeffs = [number, number, number, number];

const createThresholdsAroundMedian = (
  medianValue: number | undefined,
  coeffs: ThresholdCoeffs
) => {
  const m = medianValue ?? 0;
  const domain = [m * coeffs[0], m * coeffs[1], m * coeffs[2], m * coeffs[3]];
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

const mkThresholdColorScaleSpec: (
  coeffs: ThresholdCoeffs
) => IndicatorColorScaleSpec = (coeffs: ThresholdCoeffs) => ({
  thresholds: (medianValue, values) => {
    if (medianValue) {
      const m = medianValue;
      return createThresholdsAroundMedian(m, coeffs);
    }
    return extent(values) as [number, number];
  },
  palette: () => chartPalette.diverging.GreenToOrange,
});

const defaultColorScaleSpec = mkThresholdColorScaleSpec([
  0.85, 0.95, 1.05, 1.15,
]);
const networkCostsColorScaleSpec = mkThresholdColorScaleSpec([
  0.7, 0.9, 1.1, 1.3,
]);

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
  networkCosts: networkCostsColorScaleSpec,
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
