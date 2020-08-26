import {
  schemeAccent,
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  timeDay,
  timeHour,
  timeMinute,
  timeMonth,
  timeParse,
  timeYear,
  formatLocale,
} from "d3";
import React from "react";
import { useLocale } from "../lib/use-locale";
import { d3FormatLocales, d3TimeFormatLocales } from "../locales/locales";
import { useTheme } from "../themes";
import { estimateTextWidth } from "../lib/estimate-text-width";
import { GenericObservation } from "./data";
import { ANNOTATION_TRIANGLE_HEIGHT } from "../components/charts-generic/annotation/annotation-x";

export const isNumber = (x: $IntentionalAny): boolean =>
  typeof x === "number" && !isNaN(x);
export const mkNumber = (x: $IntentionalAny): number => +x;

export const useFormatNumber = () => {
  const locale = useLocale();
  const formatter = React.useMemo(() => {
    const { format } = d3FormatLocales[locale];
    return format(",.2~f");
  }, [locale]);
  return formatter;
};

// Swiss currency format uses a decimal point, not a comma!

const chCurrencyFormatLocale = formatLocale({
  decimal: ".",
  thousands: "'",
  grouping: [3],
  currency: ["CHF ", ""],
}).format(",.2f");

export const useFormatCurrency = () => {
  return chCurrencyFormatLocale;
};

const parseTime = timeParse("%Y-%m-%dT%H:%M:%S");
const parseDay = timeParse("%Y-%m-%d");
const parseMonth = timeParse("%Y-%m");
const parseYear = timeParse("%Y");
export const parseDate = (dateStr: string): Date =>
  parseTime(dateStr) ??
  parseDay(dateStr) ??
  parseMonth(dateStr) ??
  parseYear(dateStr) ??
  // This should probably not happen
  new Date(dateStr);

/**
 * Formats dates automatically based on their precision in LONG form.
 *
 * Use wherever dates are displayed without being in context of other dates (e.g. in tooltips)
 */
export const useFormatFullDateAuto = () => {
  const locale = useLocale();
  const formatter = React.useMemo(() => {
    const { format } = d3TimeFormatLocales[locale];

    const formatSecond = format("%d.%m.%Y %H:%M:%S");
    const formatMinute = format("%d.%m.%Y %H:%M");
    const formatHour = format("%d.%m.%Y %H:%M");
    const formatDay = format("%d.%m.%Y");
    const formatMonth = format("%m.%Y");
    const formatYear = format("%Y");

    return (date: Date) => {
      return (timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
        ? formatMinute
        : timeDay(date) < date
        ? formatHour
        : timeMonth(date) < date
        ? formatDay
        : timeYear(date) < date
        ? formatMonth
        : formatYear)(date);
    };
  }, [locale]);

  return formatter;
};

/**
 * Formats dates automatically based on their precision in SHORT form.
 *
 * Use wherever dates are displayed in context of other dates (e.g. on time axes)
 */
export const useFormatShortDateAuto = () => {
  const locale = useLocale();
  const formatter = React.useMemo(() => {
    const { format } = d3TimeFormatLocales[locale];

    const formatSecond = format(":%S");
    const formatMinute = format("%H:%M");
    const formatHour = format("%H");
    const formatDay = format("%d");
    const formatMonth = format("%b");
    const formatYear = format("%Y");

    return (date: Date) => {
      return (timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
        ? formatMinute
        : timeDay(date) < date
        ? formatHour
        : timeMonth(date) < date
        ? formatDay
        : timeYear(date) < date
        ? formatMonth
        : formatYear)(date);
    };
  }, [locale]);

  return formatter;
};

export const getPalette = (
  palette: string | undefined
): ReadonlyArray<string> => {
  const theme = useTheme();
  switch (palette) {
    case "accent":
      return schemeAccent;
    case "category10":
      return schemeCategory10;
    case "dark2":
      return schemeDark2;
    case "paired":
      return schemePaired;
    case "pastel1":
      return schemePastel1;
    case "pastel2":
      return schemePastel2;
    case "set1":
      return schemeSet1;
    case "set2":
      return schemeSet2;
    case "set3":
      return schemeSet3;
    case "elcom":
      return theme.palettes.categorical;
    default:
      return schemeCategory10;
  }
};

type Key = string | number;
export const pivot_longer = <
  T extends { [K in Key]: string | number },
  K extends keyof T
>({
  data,
  cols,
  name_to,
}: {
  data: Array<T>;
  cols: Array<K>;
  name_to: Key;
}) => {
  const pivoted = cols
    .map((col) =>
      data.map((d) => {
        const keysToKeep = Object.keys(d).filter(
          (k) => !cols.some((c) => c == k)
        );
        const keep = keysToKeep.reduce(
          (obj, cur) => ({ ...obj, [cur]: d[cur] }),
          {}
        );

        return {
          ...keep,
          [name_to]: col,
          value: d[col],
        };
      })
    )
    .reduce((acc, val) => acc.concat(val), []);
  return pivoted;
};

export const getAnnotationSpaces = ({
  annotation,
  getX,
  getLabel,
  format,
  width,
  annotationfontSize,
}: {
  annotation: { [x: string]: string | number | boolean }[];
  getX: (x: GenericObservation) => number;
  getLabel: (x: GenericObservation) => string;
  format: (n: number) => string;
  width: number;
  annotationfontSize: number;
}) => {
  return annotation
    ? annotation.reduce(
        (acc, datum, i) => {
          const splitLabel = getLabel(datum).split(" ");
          // Nb of spaces in the label + 1 space between value and label
          const nbOfSpaces = splitLabel.length + 1;
          const labelLength =
            splitLabel.reduce(
              (acc, cur) => acc + estimateTextWidth(cur, annotationfontSize),
              0
            ) +
            nbOfSpaces * estimateTextWidth(" ", annotationfontSize);

          const oneFullLine =
            estimateTextWidth(format(getX(datum)), annotationfontSize) +
            labelLength;

          // On smaller screens, anotations may break on several lines
          const nbOfLines = Math.ceil(oneFullLine / width);

          acc.push({
            height:
              acc[i].height +
              // annotation height
              nbOfLines * annotationfontSize +
              // size of annotation indicator (triangle below label)
              ANNOTATION_TRIANGLE_HEIGHT +
              // + margin between annotations
              20,
            nbOfLines,
          });
          return acc;
        },
        [{ height: 0, nbOfLines: 1 }]
      )
    : [{ height: 0, nbOfLines: 1 }];
};
