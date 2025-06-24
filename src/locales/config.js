export const defaultLocale =
  process.env.NODE_ENV === "development" ? "en" : "de";

// The order specified here will determine the fallback order when strings are not available in the preferred language
export const locales = [
  "de",
  "fr",
  "it",

  // TODO: Use buildEnv when we figure out how to import the src/env/build file
  ...(process.env.NODE_ENV === "development" ||
  process.env.ALLOW_ENGLISH === "true"
    ? ["en"]
    : []),
];
export const accentLocales = ["de", "fr", "it", "en"];
