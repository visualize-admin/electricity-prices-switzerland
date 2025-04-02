import { i18n } from "@lingui/core";
import {
  formatLocale,
  FormatLocaleDefinition,
  timeFormatLocale,
  TimeLocaleDefinition,
} from "d3";
import {
  de as pluralsDe,
  fr as pluralsFr,
  it as pluralsIt,
  en as pluralsEn,
} from "make-plural/plurals";

// We need to import with relative imports from node_modules otherwise we have
// errors from vite-import-analysis
import numberFormatCh from "../../node_modules/d3-format/locale/de-CH.json";
import timeFormatDe from "../../node_modules/d3-time-format/locale/de-CH.json";
import timeFormatEn from "../../node_modules/d3-time-format/locale/en-GB.json";
import timeFormatFr from "../../node_modules/d3-time-format/locale/fr-FR.json";
import timeFormatIt from "../../node_modules/d3-time-format/locale/it-IT.json";

import { messages as catalogDe } from "./de/messages";
import { messages as catalogFr } from "./fr/messages";
import { messages as catalogIt } from "./it/messages";

export const defaultLocale = "de";

// The order specified here will determine the fallback order when strings are not available in the preferred language
export const locales = ["de", "fr", "it"] as const;

export type Locale = "de" | "fr" | "it";

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
