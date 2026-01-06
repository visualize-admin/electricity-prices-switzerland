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

const createMakeScale = (
  thresholds: Threshold[],
  palette: string[]
): (() => ScaleThreshold<number, string>) => {
  return () => {
    const domainValues = thresholds
      .map((t) => t.value)
      .filter((v) => v !== undefined);
    return scaleThreshold<number, string>().domain(domainValues).range(palette);
  };
};

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

    return {
      thresholds,
      palette,
      makeScale: createMakeScale(thresholds, palette),
    };
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

    return {
      thresholds,
      palette: yesNoFromPalette,
      makeScale: createMakeScale(thresholds, yesNoFromPalette),
    };
  };

  const daysInAdvanceOutageNotificationThresholdEncoding: ThresholdEncoding = (
    medianValue,
    values,
    year,
    palette
  ) => {
    const result = defaultThresholdEncoding(medianValue, values, year, palette);
    const reversedPalette = result.palette.slice().reverse();

    return {
      thresholds: result.thresholds,
      palette: reversedPalette,
      makeScale: createMakeScale(result.thresholds, reversedPalette),
    };
  };

  const complianceThresholdEncoding: ThresholdEncoding = (
    medianValue,
    values,
    year,
    paletteParam
  ) => {
    const result = defaultThresholdEncoding(
      medianValue,
      values,
      year,
      paletteParam
    );

    return {
      thresholds: result.thresholds,
      palette: result.palette,
      makeScale: createMakeScale(result.thresholds, result.palette),
    };
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
