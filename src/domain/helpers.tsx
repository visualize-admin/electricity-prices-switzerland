import {
  color,
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
} from "d3";
import React from "react";

import { ANNOTATION_TRIANGLE_HEIGHT } from "src/components/charts-generic/annotation/annotation-x";
import { GenericObservation } from "src/domain/data";
import { estimateTextWidth } from "src/lib/estimate-text-width";
import { useLocale } from "src/lib/use-locale";
import { d3FormatLocales, d3TimeFormatLocales } from "src/locales/locales";
import { chartPalette, palette as themePalette } from "src/themes/palette";
import { typography } from "src/themes/typography";

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

// We don't use CHF currency because the unit used is Rp./kWh. Intead we just reuse the regular number format:
// E.g. 3,5 Rp./kWh, 1 Rp./kWh
// Same as useFormatNumber currently
export const useFormatCurrency = (alwaysLeaveDecimals: boolean = false) => {
  const locale = useLocale();
  const formatter = React.useMemo(() => {
    const { format } = d3FormatLocales[locale];
    return format(alwaysLeaveDecimals ? ",.2f" : ",.2~f");
  }, [locale, alwaysLeaveDecimals]);
  return formatter;
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
      return (
        timeMinute(date) < date
          ? formatSecond
          : timeHour(date) < date
          ? formatMinute
          : timeDay(date) < date
          ? formatHour
          : timeMonth(date) < date
          ? formatDay
          : timeYear(date) < date
          ? formatMonth
          : formatYear
      )(date);
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
      return (
        timeMinute(date) < date
          ? formatSecond
          : timeHour(date) < date
          ? formatMinute
          : timeDay(date) < date
          ? formatHour
          : timeMonth(date) < date
          ? formatDay
          : timeYear(date) < date
          ? formatMonth
          : formatYear
      )(date);
    };
  }, [locale]);

  return formatter;
};

export const getPalette = (
  palette: string | undefined
): ReadonlyArray<string> => {
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
      return chartPalette.categorical.slice(1).map((c) => c);
    case "monochrome":
      return [themePalette.monochrome[100]];
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
  annotationFontSize,
}: {
  annotation: { [x: string]: string | number | boolean }[];
  getX: (x: GenericObservation) => number;
  getLabel: (x: GenericObservation) => string | undefined;
  format: (n: number) => string;
  width: number;
  annotationFontSize: number;
}) => {
  return annotation
    ? annotation.reduce(
        (acc, datum, i) => {
          const splitLabel = getLabel(datum)?.split(" ") || [];
          // Nb of spaces in the label + 1 space between value and label
          const nbOfSpaces = splitLabel.length + 1;
          const labelLength =
            splitLabel.reduce(
              (acc, cur) => acc + estimateTextWidth(cur, annotationFontSize),
              0
            ) +
            nbOfSpaces * estimateTextWidth(" ", annotationFontSize);

          const oneFullLine =
            estimateTextWidth(format(getX(datum)), annotationFontSize) +
            labelLength;

          // On smaller screens, annotations may break on several lines
          const nbOfLines = Math.ceil(oneFullLine / width);

          acc.push({
            height:
              acc[i].height +
              // annotation height
              nbOfLines * annotationFontSize +
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

export const getOpacityRanges = (c: number) => {
  switch (c) {
    case 1:
      return [1];
    case 2:
      return [1, 0.8];
    case 3:
      return [1, 0.8, 0.6];
    case 4:
      return [1, 0.8, 0.6, 0.4];
    case 5:
      return [1, 0.8, 0.6, 0.4, 0.2];
    case 6:
      return [1, 0.85, 0.7, 0.55, 0.4, 0.25];
    case 7:
      return [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4];
    case 8:
      return [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
    case 9:
      return [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];
    case 10:
      return [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
    case 11:
      return [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.44, 0.36, 0.28];
    case 12:
      return [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.44, 0.36, 0.28, 0.2];
    case 13:
      return [
        1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.44, 0.36, 0.28, 0.2, 0.12,
      ];
    default:
      return [
        1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.44, 0.36, 0.28, 0.2, 0.12,
      ];
  }
};

const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const getContrastColor = (background: string): "black" | "white" => {
  const c = color(background)?.rgb();
  if (!c) return "black";

  const bgLuminance = getRelativeLuminance(c.r, c.g, c.b);

  const contrastWithWhite = (1.0 + 0.05) / (bgLuminance + 0.05);
  const contrastWithBlack = (bgLuminance + 0.05) / (0.0 + 0.05);

  return contrastWithWhite >= contrastWithBlack ? "white" : "black";
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
const fontFamily = typography.fontFamily as string;

export const getTextWidth = (
  text: string,
  options: { fontSize: number; fontWeight?: number | "normal" | "bold" }
) => {
  if (!canvas) {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  const weight = options.fontWeight ?? "normal";
  ctx.font = `${weight} ${options.fontSize}px ${fontFamily}`;

  return ctx.measureText(text).width;
};

export const filterBySeparator = (
  arr: string[],
  prev: string[],
  separator: string
): string[] => {
  const prevHasSeparator = prev.includes(separator);
  const arrHasSeparator = arr.includes(separator);

  if (arr.length === 0) return [separator];
  if (!prevHasSeparator && arrHasSeparator) return [separator];

  return arr.filter((item) => item !== separator);
};
