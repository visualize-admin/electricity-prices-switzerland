// If translations get too big, we should load them dynamically. But for now it's fine.
// Use the same number format in each language
import { formatLocale, FormatLocaleDefinition } from "d3-format";
import numberFormatCh from "d3-format/locale/de-CH.json";
import { timeFormatLocale, TimeLocaleDefinition } from "d3-time-format";
import timeFormatDe from "d3-time-format/locale/de-CH.json";
import timeFormatEn from "d3-time-format/locale/en-GB.json";
import timeFormatFr from "d3-time-format/locale/fr-FR.json";
import timeFormatIt from "d3-time-format/locale/it-IT.json";

import {
  de as pluralsDe,
  fr as pluralsFr,
  it as pluralsIt,
  en as pluralsEn,
} from "make-plural/plurals";

export const defaultLocale = "de";

// The order specified here will determine the fallback order when strings are not available in the preferred language
export const locales = ["de", "fr", "it"] as const;

export type Locale = "de" | "fr" | "it";

export type Locales = "de" | "fr" | "it" | "en";

/**
 * Parses a valid app locale from a locale string (e.g. a Accept-Language header).
 * If unparseable, returns default locale.
 * @param localeString locale string, e.g. de,en-US;q=0.7,en;q=0.3
 */
export const parseLocaleString = (localeString: string): Locale => {
  const result = /^(de|fr|it)/.exec(localeString);
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
