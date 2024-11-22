const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = require("@next/mdx")();
const { nodeFileTrace } = require("@vercel/nft");

const pkg = require("./package.json");
const { locales, defaultLocale } = require("./src/locales/locales.json");

const { I18N_DOMAINS, WEBPACK_ASSET_PREFIX, MATOMO_ID } = process.env;

const buildEnv = {
  VERSION: `v${pkg.version}`,
  DEPLOYMENT: process.env.DEPLOYMENT,
  CURRENT_PERIOD: process.env.CURRENT_PERIOD,
  FIRST_PERIOD: process.env.FIRST_PERIOD,
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

const nextConfig = async () => {
  const { fileList: additionalTracedFiles } = await nodeFileTrace(
    // add entry points for the missing packages or any additional scripts you need here
    [
      require.resolve("./configure-proxy"),
      require.resolve("global-agent/bootstrap"),
    ],
    {
      // ignore unnecesary files if nft includes too many (in my case: it included absolutely everything in node_modules/.bin)
      ignore: (file) => {
        return file.replace(/\\/g, "/").startsWith("node_modules/.bin/");
      },
    }
  );

  /** @type {import("next").NextConfig} */
  const config = {
    output: "standalone",
    experimental: {
      outputFileTracingIncludes: {
        "**": [...additionalTracedFiles],
      },
    },
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
  };

  return withBundleAnalyzer(withMDX(config));
};

module.exports = nextConfig;
