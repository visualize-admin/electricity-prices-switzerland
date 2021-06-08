const pkg = require("./package.json");
const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const { locales, defaultLocale } = require("./src/locales/locales.json");

const buildEnv = {
  VERSION: `v${pkg.version}`,
  DEPLOYMENT: process.env.DEPLOYMENT,
  MATOMO_ID: process.env.MATOMO_ID,
};

console.log("Build Environment:", buildEnv);

let i18nDomains;

try {
  if (process.env.I18N_DOMAINS !== undefined) {
    const domainsEnv = JSON.parse(process.env.I18N_DOMAINS);

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
    future: {
      webpack5: true,
    },
    // Build-time env variables
    env: buildEnv,

    pageExtensions: ["js", "ts", "tsx", "mdx"],

    i18n: {
      locales,
      defaultLocale,
      domains: i18nDomains,
      localeDetection: false,
    },

    webpack(config, { dev, isServer, defaultLoaders }) {
      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      });

      return config;
    },
  })
);
