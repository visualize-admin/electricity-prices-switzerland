export const DISPLAY_INTEGER_FROM_ABS = 1000;

type D3LocaleFormat = (spec: string) => (n: number) => string;

const normalizeNumberStringForUi = (s: string) => s.replace(/\u2212/g, "-");

export const formatDisplayNumber = (
  value: number,
  format: D3LocaleFormat
): string => {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  const raw =
    Math.abs(value) >= DISPLAY_INTEGER_FROM_ABS
      ? format(",.0f")(value)
      : format(",.2f")(value);
  return normalizeNumberStringForUi(raw);
};

export const formatIntegerNumber = (
  value: number,
  format: D3LocaleFormat
): string => {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  return normalizeNumberStringForUi(format(",.0f")(value));
};

/** Integers from |n| >= 10; up to 2 trimmed decimals below so small domains (meteringrate) don't collapse to 0, 0, 1, 1. */
export const formatAxisNumber = (
  value: number,
  format: D3LocaleFormat
): string => {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Math.abs(value) >= 10) {
    return formatIntegerNumber(value, format);
  }
  return normalizeNumberStringForUi(format(",.2~f")(value));
};
