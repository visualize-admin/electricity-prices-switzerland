const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "de",
    locales: ["de", "fr", "it"],
  },
  /**
   * Below line necessary for Vercel
   * @see https://github.com/i18next/next-i18next/issues/462
   */
  localePath: path.resolve("./public/locales"),
};
