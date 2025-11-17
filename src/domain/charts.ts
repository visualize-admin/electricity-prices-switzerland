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

export type Threshold = {
  value: number;
  label: string;
};

type IndicatorColorScaleSpec = {
  getLegendData: (
    medianValue: number | undefined,
    values: number[],
    year: number
  ) => {
    thresholds: Threshold[];
    palette: string[];
  };
};

const mkThresholdColorScaleSpec: (
  coeffs: ThresholdCoeffs
) => IndicatorColorScaleSpec = (coeffs: ThresholdCoeffs) => ({
  getLegendData: (medianValue, values) => {
    const domain = medianValue
      ? createThresholdsAroundMedian(medianValue, coeffs)
      : (extent(values) as [number, number]);

    const palette = chartPalette.diverging.GreenToOrange;

    // Validate that palette length is domain length + 1
    if (palette.length !== domain.length + 1) {
      throw new Error(
        `Palette length (${palette.length}) must be domain length + 1 (${domain.length + 1})`
      );
    }

    const thresholds: Threshold[] = domain.map((value, i) => {
      if (!medianValue) {
        return { value, label: "" };
      }
      const percentDiff = ((value - medianValue) / medianValue) * 100;
      const sign = percentDiff > 0 ? "+" : "";
      return { value, label: `${sign}${Math.round(percentDiff)}%` };
    });

    return { thresholds, palette };
  },
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

const outageInfoSpec: IndicatorColorScaleSpec = {
  getLegendData: () => ({
    thresholds: [
      { value: 0.5, label: "No" },
      { value: 0.5, label: "Yes" },
    ],
    palette: yesNoPalette,
  }),
};

const daysInAdvanceOutageNotificationSpec: IndicatorColorScaleSpec = {
  getLegendData: (medianValue, values, year) => {
    const { thresholds, palette } = defaultColorScaleSpec.getLegendData(
      medianValue,
      values,
      year
    );
    return {
      thresholds,
      palette: palette.slice().reverse(),
    };
  },
};

const complianceSpec: IndicatorColorScaleSpec = {
  getLegendData: (_medianValue, _values, year) => ({
    thresholds: [
      { value: year > 2026 ? 60.01 : 75.01, label: "No" },
      { value: year > 2026 ? 60.01 : 75.01, label: "Yes" },
    ],
    palette: yesNoPalette.slice().reverse(),
  }),
};

export const colorScaleSpecs: Record<
  "energyPrices" | SunshineIndicator,
  IndicatorColorScaleSpec
> = {
  energyPrices: defaultColorScaleSpec,
  outageInfo: outageInfoSpec,
  networkCosts: networkCostsColorScaleSpec,
  netTariffs: defaultColorScaleSpec,
  energyTariffs: defaultColorScaleSpec,
  saidi: defaultColorScaleSpec,
  saifi: defaultColorScaleSpec,
  daysInAdvanceOutageNotification: daysInAdvanceOutageNotificationSpec,
  compliance: complianceSpec,
};

export const makeColorScale = (
  spec: IndicatorColorScaleSpec,
  medianValue: number | undefined,
  values: number[],
  year: number
) => {
  const { thresholds, palette } = spec.getLegendData(medianValue, values, year);
  const domain = thresholds.map((t) => t.value);
  return scaleThreshold<number, string>().domain(domain).range(palette);
};
