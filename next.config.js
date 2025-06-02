const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = require("@next/mdx")();
const { withSentryConfig } = require("@sentry/nextjs");
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

    outputFileTracingIncludes: {
      "**": [...additionalTracedFiles],
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

    webpack(config, { isServer }) {
      // Fixes npm packages that depend on `fs` module
      if (!isServer) {
        config.resolve.fallback = { fs: false };
      }
      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      });

      return config;
    },
  };

  return withBundleAnalyzer(withMDX(config));
};

module.exports = nextConfig;

// Injected content via Sentry wizard below

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "interactive-things",
  project: "elcom-strompreise",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
