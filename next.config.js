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
      domains: [
        // REF
        { domain: "www.strompreis.ref.elcom.admin.ch", defaultLocale: "de" },
        { domain: "fr.strompreis.ref.elcom.admin.ch", defaultLocale: "fr" },
        {
          domain: "it.strompreis.ref.elcom.admin.ch",
          defaultLocale: "it",
        },

        // PROD
        { domain: "www.strompreis.elcom.admin.ch", defaultLocale: "de" },
        { domain: "www.prix-electricite.elcom.admin.ch", defaultLocale: "fr" },
        {
          domain: "www.prezzi-elettricita.elcom.admin.ch",
          defaultLocale: "it",
        },
      ],
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
