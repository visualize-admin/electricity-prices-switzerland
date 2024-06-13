const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = require("@next/mdx")();

const pkg = require("./package.json");
const { locales, defaultLocale } = require("./src/locales/locales.json");

const {
  I18N_DOMAINS,
  WEBPACK_ASSET_PREFIX,
  CURRENT_PERIOD = "2025",
  FIRST_PERIOD = "2009",
  DEPLOYMENT,
  MATOMO_ID,
} = process.env;

const buildEnv = {
  VERSION: `v${pkg.version}`,
  DEPLOYMENT: DEPLOYMENT,
  CURRENT_PERIOD: CURRENT_PERIOD,
  FIRST_PERIOD: FIRST_PERIOD,
};

console.log("Build Environment:", buildEnv);
console.log("Matomo ID:", MATOMO_ID);
console.log("Asset prefix:", WEBPACK_ASSET_PREFIX);

let i18nDomains;

try {
  if (I18N_DOMAINS !== undefined) {
    const domainsEnv = JSON.parse(I18N_DOMAINS);

    i18nDomains = Object.entries(domainsEnv).map(([locale, domain]) => {
      return {
        domain,
        defaultLocale: locale,
      };
    });
  }
} catch (e) {
  console.error("I18N_DOMAINS parsing failed:", e.message);
}

module.exports = withBundleAnalyzer(
  withMDX({
    assetPrefix:
      WEBPACK_ASSET_PREFIX !== undefined && WEBPACK_ASSET_PREFIX !== ""
        ? WEBPACK_ASSET_PREFIX
        : undefined,

    // Build-time env variables
    env: buildEnv,

    pageExtensions: ["js", "ts", "tsx", "mdx"],

    i18n: {
      locales,
      defaultLocale,
      domains: i18nDomains,
      localeDetection: false,
    },

    webpack(config) {
      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      });
      config.module.rules.push({
        test: /\.xml$/,
        exclude: /node_modules/,
        loader: "raw-loader",
      });

      return config;
    },
  })
);
