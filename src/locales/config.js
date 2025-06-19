export const defaultLocale =
  process.env.NODE_ENV === "development" ? "en" : "de";

// The order specified here will determine the fallback order when strings are not available in the preferred language
export const locales = [
  "de",
  "fr",
  "it",
  ...(process.env.NODE_ENV === "development" ? ["en", "aa"] : []),
];
export const accentLocales = ["de", "fr", "it", "en"];
