const pkg = require("./package.json");
const { getGitCommitSHA } = require("./src/lib/git");
const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const { locales, defaultLocale } = require("./src/locales/locales.json");

module.exports = () => {
  const buildEnv = {
    VERSION: `v${pkg.version}-${getGitCommitSHA().slice(0, 7)}`,
    DEPLOYMENT: process.env.DEPLOYMENT,
    CURRENT_PERIOD: process.env.CURRENT_PERIOD || "2023",
    FIRST_PERIOD: process.env.FIRST_PERIOD || "2009",
  };

  console.log("Build Environment:", buildEnv);
  console.log("Matomo ID:", process.env.MATOMO_ID);

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
  return withBundleAnalyzer(
    withMDX({
      webpack5: true,

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
        config.module.rules.push({
          test: /\.xml$/,
          exclude: /node_modules/,
          loader: "raw-loader",
        });

        return config;
      },
    })
  );
};
