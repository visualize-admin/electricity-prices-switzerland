import { extent, ScaleThreshold, scaleThreshold } from "d3";
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
  value: number | undefined;
  label: string;
};

type ThresholdEncodingResult = {
  thresholds: Threshold[];
  palette: string[];
  makeScale: () => ScaleThreshold<number, string>;
};

type ThresholdEncoding = (
  medianValue: number | undefined,
  values: number[],
  year: number,
  palette?: string[]
) => ThresholdEncodingResult;

const makeThresholdEncoding: (
  coeffs: ThresholdCoeffs,
  defaultPalette: string[]
) => ThresholdEncoding =
  (coeffs: ThresholdCoeffs, defaultPalette: string[]) =>
  (medianValue, values, _year, palette = defaultPalette) => {
    const domain = medianValue
      ? createThresholdsAroundMedian(medianValue, coeffs)
      : (extent(values) as [number, number]);

    const thresholds: Threshold[] = domain.map((value) => {
      if (!medianValue) {
        return { value, label: "" };
      }
      const percentDiff = ((value - medianValue) / medianValue) * 100;
      const sign = percentDiff > 0 ? "+" : "";
      return { value, label: `${sign}${Math.round(percentDiff)}%` };
    });

    const makeScale = () => {
      const domainValues = thresholds

        .map((t) => t.value)
        .filter((v) => v !== undefined);
      return scaleThreshold<number, string>()
        .domain(domainValues)
        .range(palette);
    };

    return { thresholds, palette, makeScale };
  };

export const createEncodings = (palette: string[]) => {
  const defaultThresholdEncoding = makeThresholdEncoding(
    [0.85, 0.95, 1.05, 1.15],
    palette
  );
  const networkCostsThresholdEncoding = makeThresholdEncoding(
    [0.7, 0.9, 1.1, 1.3],
    palette
  );

  const yesNoPalette = [last(palette), first(palette)] as string[];

  const outageInfoThresholdEncoding: ThresholdEncoding = (
    _medianValue,
    _values,
    _year,
    paletteParam
  ) => {
    const usePalette = paletteParam ?? yesNoPalette;
    const yesNoFromPalette = [first(usePalette), last(usePalette)] as string[];

    const thresholds = [
      { value: 0.5, label: "No" },
      { value: 0.5, label: "Yes" },
    ];

    const makeScale = () => {
      const domainValues = thresholds.map((t) => t.value);
      return scaleThreshold<number, string>()
        .domain(domainValues)
        .range(yesNoFromPalette);
    };

    return { thresholds, palette: yesNoFromPalette, makeScale };
  };

  const daysInAdvanceOutageNotificationThresholdEncoding: ThresholdEncoding = (
    medianValue,
    values,
    year,
    palette
  ) => {
    const result = defaultThresholdEncoding(medianValue, values, year, palette);
    const reversedPalette = result.palette.slice().reverse();

    const makeScale = () => {
      const domainValues = result.thresholds
        .map((t) => t.value)
        .filter((v) => v !== undefined);
      return scaleThreshold<number, string>()
        .domain(domainValues)
        .range(reversedPalette);
    };

    return {
      thresholds: result.thresholds,
      palette: reversedPalette,
      makeScale,
    };
  };

  const complianceThresholdEncoding: ThresholdEncoding = (
    _medianValue,
    _values,
    year,
    paletteParam
  ) => {
    const usePalette = paletteParam ?? yesNoPalette;
    const yesNoFromPalette = [last(usePalette), first(usePalette)] as string[];

    const thresholds = [
      // Labels are not used in this case, but kept for consistency
      { value: year >= 2026 ? 60.01 : 75.01, label: "No" },
      { value: year >= 2026 ? 60.01 : 75.01, label: "Yes" },
    ];

    const makeScale = () => {
      const domainValues = thresholds.map((t) => t.value);
      return scaleThreshold<number, string>()
        .domain(domainValues)
        .range(yesNoFromPalette);
    };

    return { thresholds, palette: yesNoFromPalette, makeScale };
  };

  return {
    energyPrices: defaultThresholdEncoding,
    outageInfo: outageInfoThresholdEncoding,
    networkCosts: networkCostsThresholdEncoding,
    netTariffs: defaultThresholdEncoding,
    energyTariffs: defaultThresholdEncoding,
    saidi: defaultThresholdEncoding,
    saifi: defaultThresholdEncoding,
    daysInAdvanceOutageNotification:
      daysInAdvanceOutageNotificationThresholdEncoding,
    compliance: complianceThresholdEncoding,
  } as const;
};

// Define a diverging palette for sunshine indicators, goes from
// low (bad) to high (good) values, using interpolatePuOr
// In the future, we could introduce color blind friendly palettes
// const colorBindDivergingPalette = Array.from({ length: 5 }, (_, i) => {
//   const minT = 0.2;
//   const maxT = 0.8;
//   const t = minT + (i / (5 - 1)) * (maxT - minT);
//   return interpolateRdBu(t);
// });

export const thresholdEncodings: Record<
  "energyPrices" | SunshineIndicator,
  ThresholdEncoding
> = createEncodings(chartPalette.diverging.GreenToOrange);
