import { i18n } from "@lingui/core";
import {
  formatLocale,
  FormatLocaleDefinition,
  timeFormatLocale,
  TimeLocaleDefinition,
} from "d3";
import {
  de as pluralsDe,
  en as pluralsEn,
  fr as pluralsFr,
  it as pluralsIt,
} from "make-plural/plurals";

import { defaultLocale } from "src/locales/config.js";

import { messages as catalogDe } from "./de/messages";
import { messages as catalogEn } from "./en/messages";
import { messages as catalogFr } from "./fr/messages";
import { messages as catalogIt } from "./it/messages";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const numberFormatCh = require("d3-format/locale/de-CH");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const timeFormatDe = require("d3-time-format/locale/de-CH");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const timeFormatEn = require("d3-time-format/locale/en-GB");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const timeFormatFr = require("d3-time-format/locale/fr-FR");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const timeFormatIt = require("d3-time-format/locale/it-IT");

export type Locale = "de" | "fr" | "it" | "en";

i18n.loadLocaleData({
  de: { plurals: pluralsDe },
  fr: { plurals: pluralsFr },
  it: { plurals: pluralsIt },
  en: { plurals: pluralsEn },
});
i18n.load({
  de: catalogDe,
  fr: catalogFr,
  it: catalogIt,
  en: catalogEn,
});
i18n.activate(defaultLocale);

export { i18n };

/**
 * Parses a valid app locale from a locale string (e.g. a Accept-Language header).
 * If unparseable, returns default locale.
 * @param localeString locale string, e.g. de,en-US;q=0.7,en;q=0.3
 */
export const parseLocaleString = (localeString: string | undefined): Locale => {
  if (!localeString) {
    return defaultLocale;
  }
  const result = /^(de|fr|it|en|aa)/.exec(localeString);
  return result ? (result[1] as Locale) : defaultLocale;
};

export const d3TimeFormatLocales = {
  de: timeFormatLocale(timeFormatDe as TimeLocaleDefinition),
  fr: timeFormatLocale(timeFormatFr as TimeLocaleDefinition),
  it: timeFormatLocale(timeFormatIt as TimeLocaleDefinition),
  en: timeFormatLocale(timeFormatEn as TimeLocaleDefinition),
} as const;

export const d3FormatLocales = {
  de: formatLocale(numberFormatCh as FormatLocaleDefinition),
  fr: formatLocale(numberFormatCh as FormatLocaleDefinition),
  it: formatLocale(numberFormatCh as FormatLocaleDefinition),
  en: formatLocale(numberFormatCh as FormatLocaleDefinition),
} as const;
