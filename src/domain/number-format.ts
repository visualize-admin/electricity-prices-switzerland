export const DISPLAY_INTEGER_FROM_ABS = 1000;

type D3LocaleFormat = (spec: string) => (n: number) => string;

export const normalizeNumberStringForUi = (s: string) =>
  s.replace(/\u2212/g, "-");

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

const formatIntegerNumber = (value: number, format: D3LocaleFormat): string => {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  return normalizeNumberStringForUi(format(",.0f")(value));
};

export const formatAxisNumber = formatIntegerNumber;
