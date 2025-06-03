import withBundleAnalyzer from "@next/bundle-analyzer";
import withMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";
import { nodeFileTrace } from "@vercel/nft";
import { NextConfig } from "next";

import { defaultLocale, locales } from "src/locales/locales";

import pkg from "./package.json";

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

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

type I18NDomains = { domain: string; defaultLocale: string }[];
let i18nDomains: I18NDomains | undefined;

try {
  if (I18N_DOMAINS !== undefined) {
    const domainsEnv = JSON.parse(I18N_DOMAINS) as Record<string, string>;
    i18nDomains = Object.entries(domainsEnv).map(([locale, domain]) => ({
      domain: String(domain), // Ensure domain is string
      defaultLocale: locale,
    }));
  }
} catch (e) {
  if (e instanceof SyntaxError) {
    console.error("I18N_DOMAINS parsing failed:", e.message);
  }
}

const withMDXConfig = withMDX();

const nextConfig = async (): Promise<NextConfig> => {
  const { fileList: additionalTracedFiles } = await nodeFileTrace(
    [
      require.resolve("./configure-proxy"),
      require.resolve("global-agent/bootstrap"),
    ],
    {
      ignore: (file) =>
        file.replace(/\\/g, "/").startsWith("node_modules/.bin/"),
    }
  );

  const config: NextConfig = {
    output: "standalone",

    outputFileTracingIncludes: {
      "**": [...additionalTracedFiles],
    },

    assetPrefix:
      WEBPACK_ASSET_PREFIX && WEBPACK_ASSET_PREFIX !== ""
        ? WEBPACK_ASSET_PREFIX
        : undefined,

    env: buildEnv,

    pageExtensions: ["js", "ts", "tsx", "mdx"],

    i18n: {
      locales,
      defaultLocale,
      domains: i18nDomains,
      localeDetection: false,
    },

    webpack(config, { isServer }) {
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

  return withBundleAnalyzerConfig(withMDXConfig(config));
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
