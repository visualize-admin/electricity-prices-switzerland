import { accentLocales } from "./src/locales/config";

module.exports = {
  locales: accentLocales,
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["<rootDir>/src"],
      exclude: ["**/node_modules/**", "**/.next/**"],
    },
  ],
  format: "po",
  sourceLocale: "en",
  fallbackLocales: {
    default: "de",
  },
  compileNamespace: "ts",
};
