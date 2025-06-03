import withBundleAnalyzerConfig from "@next/bundle-analyzer";
import withMDXConfig from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";
import { nodeFileTrace } from "@vercel/nft";
import { NextConfig } from "next";

import { defaultLocale, locales } from "src/locales/config";

import pkg from "./package.json";

const withBundleAnalyzer = withBundleAnalyzerConfig({
  enabled: process.env.ANALYZE === "true",
});

const withMDX = withMDXConfig();

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

let i18nDomains: { domain: string; defaultLocale: string }[] = [];

try {
  if (I18N_DOMAINS !== undefined) {
    const domainsEnv = JSON.parse(I18N_DOMAINS);

    i18nDomains = Object.entries(domainsEnv).map(([locale, domain]) => {
      return {
        domain: domain as string,
        defaultLocale: locale,
      };
    });
  }
} catch (e) {
  console.error(
    "I18N_DOMAINS parsing failed:",
    e instanceof Error ? e.message : e
  );
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

  const config: NextConfig = {
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

    webpack(config: NextConfig, { isServer }) {
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

export default withSentryConfig(nextConfig, {
  org: "interactive-things",
  project: "elcom-strompreise",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  // tunnelRoute: "/monitoring",
});
